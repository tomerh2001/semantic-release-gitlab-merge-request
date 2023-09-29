
/* eslint-disable unicorn/prefer-module */

const process = require('node:process');
const {Gitlab} = require('@gitbeaker/rest');
const git = require('simple-git');

async function prepare(pluginConfig, context) {
	const {api, logger, projectId, sourceBranch, gitlabToken} = await initGitLabConfig(pluginConfig, context);

	// Fetch the project data from GitLab API
	const project = await api.Projects.show(projectId);

	// Construct the repository URL using GITLAB_URL and project.path_with_namespace
	const gitlabUrl = process.env.GITLAB_URL || pluginConfig.gitlabUrl || 'https://gitlab.com';
	const repoUrl = `${gitlabUrl}/${project.path_with_namespace}.git`.replace('https://', `https://gitlab-ci-token:${gitlabToken}@`);

	// Initialize simple-git instance
	const simpleGit = git();
	await simpleGit.addConfig('http.sslVerify', 'false');

	// Check if the "gitlab" remote exists
	const remotes = await simpleGit.getRemotes(true);
	if (!remotes.some(remote => remote.name === 'gitlab')) {
		// Only add the "gitlab" remote if it doesn't exist
		await simpleGit.addRemote('gitlab', repoUrl);
	}

	// Forcefully push to the sourceBranch on GitLab, overwriting any changes.
	await simpleGit.push(['-f', 'gitlab', `HEAD:${sourceBranch}`]);
	logger.log(`Successfully pushed (forcefully) the current branch state as ${sourceBranch} to GitLab.`);
}

async function publish(pluginConfig, context) {
	const {api, logger, version, projectId, sourceBranch} = await initGitLabConfig(pluginConfig, context);
	const targetBranch = process.env.GITLAB_TARGET_BRANCH || pluginConfig.targetBranch;

	if (!targetBranch) {
		throw new Error('Target branch is missing.');
	}

	await createMergeRequest(version, context.nextRelease.notes, logger, sourceBranch, targetBranch, api, projectId);
}

module.exports = {prepare, publish};

/**
 * Initializes the GitLab API and gathers required configuration.
 * @param {object} pluginConfig - The plugin configuration.
 * @returns {object} - Returns an object containing GitLab API, logger, and essential configuration values.
 */
async function initGitLabConfig(pluginConfig, context) {
	const {
		nextRelease: {version},
		logger,
	} = context;

	const gitlabUrl = process.env.GITLAB_URL || pluginConfig.gitlabUrl || 'https://gitlab.com';
	const gitlabToken = process.env.GITLAB_TOKEN || pluginConfig.gitlabToken;
	const projectId = process.env.GITLAB_PROJECT_ID || pluginConfig.projectId;
	const sourceBranch = process.env.GITLAB_SOURCE_BRANCH || pluginConfig.sourceBranch || `release/v${version}`;

	if (!gitlabToken || !gitlabUrl || !projectId) {
		throw new Error('Essential GitLab configurations (token, url, or projectId) are missing.');
	}

	const api = new Gitlab({
		host: gitlabUrl,
		token: gitlabToken,
	});

	return {api, logger, version, projectId, sourceBranch, gitlabToken};
}

/**
 * Creates a merge request for the given version and notes.
 * @param {string} version - The version to be released.
 * @param {string} notes - The release notes.
 * @param {object} logger - The logger object.
 * @param {string} sourceBranch - The source branch for the merge request.
 * @param {string} targetBranch - The target branch for the merge request.
 * @param {object} api - The GitLab API object.
 * @param {number} projectId - The ID of the GitLab project.
 * @returns {Promise<void>} - A Promise that resolves when the merge request is created.
 */
async function createMergeRequest(version, notes, logger, sourceBranch, targetBranch, api, projectId) {
	const mergeRequestTitle = `Release v${version}`;
	const mergeRequestDescription = notes;

	logger.log(`Creating merge request with title: ${mergeRequestTitle}`);
	logger.debug(`Creating merge request with source branch: ${sourceBranch}`);
	logger.debug(`Creating merge request with target branch: ${targetBranch}`);

	const {web_url: webUrl} = await api.MergeRequests.create(projectId, sourceBranch, targetBranch, mergeRequestTitle, {
		removeSourceBranch: true,
		description: mergeRequestDescription,
	});
	logger.log(`Merge request created: ${webUrl}`);
}

