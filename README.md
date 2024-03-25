# vue-unused-assets-finder

Identify and optionally remove unused image assets in a Vue project's codebase. This tool scans for `.vue`, `.jpg`, `.png`, `.svg` and stylesheet assets finding the files within your project that are not linked as in your Vue components. With the `--remove-assets` option, it also removes these unused assets from the filesystem.

## Installation

Install the tool globally using npm:

```bash
npm install -g vue-unused-assets-finder
```
or using `yarn`:

```bash
yarn global add vue-unused-assets-finder
```

## Usage

To find unused assets in your Vue project, navigate to your project directory in the terminal and run:

```bash
vue-unused-assets-finder
```

If you wish to remove the unused assets that are found, run:

```bash
vue-unused-assets-finder --remove-assets
```

For help and a list of options, run:

```bash
vue-unused-assets-finder --help
```

## Options

- `--remove-assets`: Remove unused assets from the filesystem.
- `--help`: Display help and a list of options.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

If you have any questions or need help with this tool, please open an issue on this repository. Also, feel free to reach out to me on [Twitter](https://twitter.com/pcnoic).

## Future Improvements

- [ ] Add support for more file types, such as unused stylesheets.
