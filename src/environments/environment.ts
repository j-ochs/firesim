// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// export const environment = {
//   production: false
// };

export const environment = {
  production: false,
  appId: '0b9ae90c37b492b7da3c843ff795f217',
  baseUrl: 'http://api.openweathermap.org/data/2.5/', 
  units:'metric'
};
export const elevationEnv = {
  production: false,
  appId: 'AIzaSyAzAy0Bp_D47hzpkNjFAY0szLh8I-f5ZTE',
  baseUrl: 'http://maps.googleapis.com/maps/api/elevation/', 
  units:'metric'
}