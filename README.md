# Etrid Documentation

Official documentation for the Etrid Network. Technical specifications, API references, validator guides, developer tutorials, and governance documentation.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Documentation Structure

```
docs/
├── getting-started/          # Introduction & quick start
│   ├── overview.md           # Platform introduction
│   ├── quick-start.md        # Quick start guide
│   └── faq.md                # Frequently asked questions
│
├── users/                    # End user guides
│   ├── user-guide.md         # Wallet, staking, transactions
│   └── community.md          # Community resources
│
├── developers/               # Developer documentation
│   ├── developer-guide.md    # Build on Etrid
│   ├── api-reference.md      # Complete API docs
│   └── api-endpoints.md      # RPC endpoints
│
├── validators/               # Validator/operator docs
│   ├── operator-guide.md     # Run a validator
│   ├── monitoring.md         # Monitoring setup
│   ├── key-management.md     # Key handling
│   ├── release-guide.md      # Release procedures
│   └── release-quickstart.md # Quick release guide
│
├── architecture/             # System design
│   └── overview.md           # Architecture overview
│
├── operations/               # Deployment & operations
│   ├── deployment-guide.md   # General deployment
│   ├── MAINNET_DEPLOYMENT_GUIDE.md
│   ├── DEVNET_DEPLOYMENT_GUIDE.md
│   └── bridge-*.md           # Bridge operations
│
├── governance/               # Governance documentation
│   └── charter.md            # Foundation charter
│
├── specifications/           # Technical specifications
│   └── ivory-paper*.md       # Ivory papers
│
├── _drafts/                  # Work in progress
└── _archive/                 # Historical documents
```

## Navigation

| Section | Description |
|---------|-------------|
| Getting Started | Introduction, quick start, FAQ |
| Users | Wallet usage, staking, community |
| Developers | API docs, SDK, tutorials |
| Validators | Node operation, monitoring |
| Architecture | System design, protocols |
| Operations | Deployment, maintenance |
| Governance | Voting, proposals, charter |
| Specifications | Ivory papers, protocol specs |

## Technology

- **Docusaurus 3** - Documentation framework
- **MDX** - Enhanced markdown
- **React** - Interactive components

## Development

```bash
# Start local server (hot reload)
npm start

# Build static site
npm run build

# Serve production build
npm run serve

# Check for broken links
npm run build  # Warnings shown during build
```

## Deployment

The documentation is automatically deployed to [docs.etrid.network](https://docs.etrid.network) on push to main.

Manual deployment:
```bash
npm run build
# Deploy build/ folder to hosting
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

See individual doc files for content guidelines.

## Related Repositories

| Repo | Description |
|------|-------------|
| [etrid](https://github.com/etaborai/etrid) | Blockchain core |
| [etrid-apps](https://github.com/etaborai/etrid-apps) | Frontend applications |
| [etrid-infra](https://github.com/etaborai/etrid-infra) | Infrastructure |

## License

CC-BY-4.0 (Creative Commons Attribution 4.0)
