# FTTS Frontend Assets

## Structure

- `public/` - the only place to hold static assets to be served from S3 in cloud deployment and mounted to nodeJS process in a local development. It is compiled by *gulp*, it is non-applciation specific;
- `partials/ `- partials added by us;
- `assets/` hold shareable application components that are consumed.

Govuk Frontend partials are located in the `govuk-frontend` dependency.


## To add/change assets:
Add a new asset/change an existing one in `assets/`

## To update Govuk assets
Run the npm script
```sh
npm run upgrade-govuk
```

## To deploy assets:
You will need to compile the assets using `npm run generate-assets`
Which will store the compiled assets under `public/`

## Useful information:

- To view available gulp tasks: `gulp --tasks`

