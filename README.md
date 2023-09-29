# semantic-release-gitlab-merge-request
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray)](https://github.com/xojs/xo)


[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to automate the creation of merge requests for GitLab repositories when releasing new versions.

## Features

- Prepare the release by pushing the release branch to GitLab.
- Automatically create a merge request for the new release.

## Install

```bash
$ npm install semantic-release-gitlab-merge-request -D 
$ yarn add semantic-release-gitlab-merge-request --dev
$ bun i semantic-release-gitlab-merge-request --dev
```

## Usage

To use this plugin, add it to your `semantic-release` configuration. For instance:

```json
{
  "plugins": [
    "semantic-release-gitlab-merge-request"
  ]
}
```

## Configuration

### Environment Variables

| Variable                    | Description                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| `GITLAB_TOKEN`              | **Required.** The token used to authenticate with GitLab.             |
| `GITLAB_URL`                | The GitLab instance URL (e.g., 'https://gitlab.com').                 |
| `GITLAB_PROJECT_ID`         | **Required.** The ID of the GitLab project.                           |
| `GITLAB_SOURCE_BRANCH`      | The source branch for the merge request (defaults to `release/vx.y.z`)|

### Options

| Option          | Description                                                  | Default                                 |
| --------------- | ------------------------------------------------------------ | --------------------------------------- |
| `gitlabToken`   | The token used to authenticate with GitLab.                  | -                                       |
| `gitlabUrl`     | The GitLab instance URL.                                     | 'https://gitlab.com'                     |
| `projectId`     | The ID of the GitLab project.                                | -                                       |
| `sourceBranch`  | The source branch for the merge request.                     | `release/vx.y.z`                        |
| `targetBranch`  | **Required.** The target branch for the merge request.       | -                                       |

Remember to replace `x.y.z` with the appropriate version numbers.

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, please [create an issue](#).

## License

[MIT License](#)
