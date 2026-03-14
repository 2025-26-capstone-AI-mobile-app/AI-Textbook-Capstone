# Contributing Guide

How to set up, code, test, review, and release so contributions meet our Definition of Done.

## Code of Conduct

Reference the project/community behavior expectations and reporting process.

### Behavior expectations
* Be respectful 
    * Feedback should be constructive and focused on improving the end product
    * Don't dismiss ideas out of hand
* Be honest and constructive
    * If disagreeing with an idea, or denying a merge request, provide constructive and concrete feedback on why you disagree/ are denying the request.
* Be inclusive
    * Make sure everyone has a chance to share their opinions during meetings or other important discussions.

### Reporting process
* If someone has been acting disrespectfully or violates one of our policies, message them first to discuss your issues with their actions
* If this fails to resolve the issue, bring up the issue at the next meeting for the group to discuss.

## Getting Started

List prerequisites, setup steps, environment variables/secrets handling, and how to run the app locally.

### Prerequisites 
* An emulator or a mobile device that can run the app. See this guide for setting up environment https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated 
    * If you want to run the app on a mobile device, you will need to download the Expo Go app.
* Nodejs v24 isntalled
* Git installed

### How to run app locally
* Clone the repo using ```git clone https://github.com/lethangomes/AI-Textbook-Capstone.git```
* cd into AI-Textnook-Capstone/AI-Textbook-App
* run ```npm install```
* run ```npx expo install prettier eslint-config-prettier eslint-plugin-prettier --dev``` on mac or ```npx expo install prettier eslint-config-prettier eslint-plugin-prettier "--" --dev``` on windows to install prettier
* run one of the following commands to start the app
    * ```npm run start``` - Brings up QR code for running app on mobile and a menu to switch to android/iOS emulation
    * ```npm run ios``` - requires iOS emulator
    * ```npm run android``` - requires android emulator
* If you're running an emulator, the app should automatically open in the emulator. If you're using a mobile device, use the first option and scan the QR code.

### Running the backend
We are using https://github.com/2025-26-capstone-AI-mobile-app/OER_tutor as the backend for our mobile app. Please follow the instructions listed on their repository to run the backend.

## Branching & Workflow

Describe the workflow (e.g., trunk-based or GitFlow), default branch, branch naming, and when to rebase vs. merge.
  * We will use trunk-based workflow.
  * Default is main.
  * Before starting any work, always pull for latest changes.
  * Create your own branch with branch naming based on the feature being worked on.
  * Make small commits.
  * Open pull request and make sure the additions pass all tests.
  * Once approved, merge with main.
  * Delete branch after the merge. 


## Issues & Planning

Explain how to file issues, required templates/labels, estimation, and triage/assignment practices.
   We can use GitHub Issues to file issues. We will make an issue template.
   Labels:
   * Bugs : Something broken or not working as expected that needs to be fixed
   * Feature : is a new capability or enhancement that needs to be implemented
   * Task : Anything that is not a feature that needs to be done

     Use GitHub Issues to assign priorities in the labels (low, medium, high).

## Commit Messages

State the convention (e.g., Conventional Commits), include examples, and how to reference issues.

Use consistent, descriptive commit messages that follow our agreed convention.

Format
```markdown
   <type> (optional scope): <short description>

```
Types:
- feat: a new feature
- fix: a bug fix
- style: code style changes (formatting, whitespace, etc.)
- test: adding or updating tests
- chore: maintenance tasks

Examples:
- feat(ui): add dark mode toggle
- fix(auth): fix token expiration bug
- docs: update contribution guide for reporting process

Referencing issues

Include the issue number in commit message when applicable:

- fix: handle null user (#23)
   

## Code Style, Linting & Formatting

Name the formatter/linter, config file locations, and the exact commands to check/fix locally.

We are using ESLint and Prettier for formatting/linting. The config file is ```./AI-textbook-App/eslint.config.js```. To check linting, run ```npx expo lint```.

## Testing

Define required test types, how to run tests, expected coverage thresholds, and when new/updated tests are mandatory.

We are using Jest and Maestro for unit and end to end tests respectively:
* Jest unit tests
    * Should be added whenever a new feature is added
    * Should be updated whenever bugs are found with existing features, or existing features are altered.
* Maestro End to End tests
    * Should be added whenever new UI elements are introduced
    * Should be updated whenever UI is altered significantly

## Pull Requests & Reviews

Outline PR requirements (template, checklist, size limits), reviewer expectations, approval rules, and required status checks.

Pull request template is in PULL_REQUEST_TEMPLATE.md and includes a self check checklist.

### Reviewer Expectations
* Review should be conducted within 24 hours of PR submission.
* Review should be constructive and respectful, focusing on ensuring the quality of the end product.
* If PR is rejected, reviewer must cite specific reasons for rejection and potential ways to fix any issues.

### Approval rules
* For a PR to be approved, it must pass all tests and be reviewed by at least one other group member.
* Should also correctly follow PR template


## CI/CD

Link to pipeline definitions, list mandatory jobs, how to view logs/re-run jobs, and what must pass before merge/release.

Our CI pipeline runs whenever a pull request is made. It checks that formatting is correct using eslint, and ensures that all unit tests are passing before the pull request is allowed to be merged. The workflow is in .github/workflows/node.js.yml

## Security & Secrets

State how to report vulnerabilities, prohibited patterns (hard-coded secrets), dependency update policy, and scanning tools.

### Reporting vulnerabilities
Any discovered vulnerabilities should be brought up at the next meeting. If vulnerability is critical an emergency meeting should be held as soon as possible.

### Prohibited patterns
* No secrets should be hard coded. All secrets should be in environment variables or .env files. If stored in a file, the file should be in .gitignore

### Dependency update policy
Dependencies should be reviewed and updated monthly or when a security advisory is issued. We can use tools like npm audit to check for vulnerabilities.

### Scanning tools
We intend to use githubs builtin secret scanner

## Documentation Expectations

Specify what must be updated (README, docs/, API refs, CHANGELOG) and docstring/comment standards.
### Required Updates
- README.md: update setup instructions, usage examples or project overview as affected.
- docs/: add or edit documentation and onboarding guides.
- API References: document new endpoints.
- CHANGELOG.md: log all user-facing changes (e.g. features, bug fixes).

### Docstring/Comment standards
All functions should have comments above them with
* A brief description of what they do
* All input arguments and any constraints they may have
* Function output

## Release Process

Describe versioning scheme, tagging, changelog generation, packaging/publishing steps, and rollback process.

We will use Semantic Versioning (MAJOR.MINOR.PATCH) for all releases.
### Release Steps
1. Ensure all merged PRs are documented in CHANGELOG.md.
2. Tag the release in GitHub using the following format: vX.Y.Z.
3. Push the tag for release automation (once CI/CD is configured).
4. Publish updated documentation if applicable.
5. If a relaease causes critical issues, revert tag and initiate rollback process.

### Rollback Process
1. Revert the problematic commit or tag.
2. Open a PR with a clear and detailed explanation of the issue.
3. Notify the team and schedule a fix or patch release. 

## Support & Contact

Provide maintainer contact channel, expected response windows, and where to ask questions.
### Maintainser Contact
Primary Maintainer: Lucas Gomes (gomesl@oregonstate.edu)
Secondary Maintainer: Joseph Slade (joseph.slade@oregonstate.edu)

### Response Expectations
Expect replies whithin 48 hours during weekdays.

### Where to Ask Questions
- Use GitHub Issues for bug reports and feature requests.
- Use GitHub Discussions for feedback and general questions or ideas.
