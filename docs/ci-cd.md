# Comment Stripper MCP - CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Comment Stripper MCP project.

## Overview

The CI/CD pipeline automatically runs tests, benchmarks, and builds the project when changes are pushed to the repository. This ensures code quality and helps catch issues early in the development process.

## Pipeline Structure

The pipeline consists of three main jobs:

1. **Test**: Runs the test suite across multiple Node.js versions
2. **Benchmark**: Measures performance metrics (only on main/master branch)
3. **Build**: Creates a production build (only on main/master branch)

## Workflow Details

### Test Job

The test job runs on every push and pull request to the main/master branch. It:

- Runs on Ubuntu latest
- Tests against Node.js versions 16.x, 18.x, and 20.x
- Installs dependencies
- Runs linting (if configured)
- Executes the test suite
- Generates a coverage report
- Uploads the coverage report to Codecov

### Benchmark Job

The benchmark job only runs when changes are pushed to the main/master branch. It:

- Runs on Ubuntu latest with Node.js 20.x
- Executes the performance benchmarks
- Saves the benchmark results as artifacts

### Build Job

The build job only runs when changes are pushed to the main/master branch. It:

- Runs on Ubuntu latest with Node.js 20.x
- Builds the project
- Uploads the build artifacts

## Configuration

The CI/CD pipeline is configured using GitHub Actions. The configuration file is located at `.github/workflows/ci.yml`.

## Setting Up Codecov Integration

To enable Codecov integration:

1. Sign up for a free account at [Codecov](https://codecov.io/)
2. Add your repository to Codecov
3. Get your Codecov token
4. Add the token as a secret in your GitHub repository settings with the name `CODECOV_TOKEN`

## Local Verification

Before pushing changes, you can run the same checks locally:

```bash
# Run tests
npm test

# Generate coverage report
npm run test:coverage

# Run benchmarks
npm run benchmark

# Build the project
npm run build
```

## Benefits

- **Automated Testing**: Ensures code changes don't break existing functionality
- **Multi-version Testing**: Verifies compatibility across different Node.js versions
- **Performance Tracking**: Monitors the impact of changes on performance
- **Build Verification**: Confirms that the project builds successfully
- **Code Coverage**: Tracks test coverage to identify untested code

## Future Enhancements

- Add automatic deployment to npm or other package registries
- Implement performance regression detection
- Add notifications for failed builds or performance regressions
