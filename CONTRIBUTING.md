# Contributing to MAP Wiki

Thank you for your interest in contributing to MAP Wiki!

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/map-wiki.git
   cd map-wiki
   ```
3. Run tests to verify setup:
   ```bash
   node test-permissions.js
   ```

## Development

### Prerequisites
- Node.js 18+
- An OpenClaw installation (for testing)

### Running Tests
```bash
node test-permissions.js
node test-wiki-tools.js
```

### Code Style
- Use standard JavaScript (ES6+)
- Include JSDoc comments for public APIs
- Keep functions small and focused
- Write tests for new features

## Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add: description of your changes"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request on GitHub

## Reporting Issues

- Use GitHub Issues for bug reports
- Include steps to reproduce
- Include Node.js version and OS
- Include relevant log output

## Feature Requests

- Open a GitHub Issue with the "enhancement" label
- Describe the feature and use case
- Explain why it would be useful

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and contribute

## License

By contributing, you agree that your contributions will be licensed under the MIT License.