# OpenVPN UI

Url template:

`http://origin/?{urlParams}#${key}`

Url example

`http://origin/?id=7e00cfadbe61f2ed&name=MyDAppNode#mc5pGQQ4VbbuWJDayJD0kXsElAUddmUktJYUYSDNaDE=`

## Mandatory params

- `id`: VPN credentials file ID. It is supplied by the VPN user managment process. 16 character hexadecimal ID, i.e. `"7e00cfadbe61f2ed"`

## Dev urls

- `http://localhost?dev=loading` : Show the loading state
- `http://localhost?dev=success` : Show the success state
- `http://localhost?dev=error` : Show an error state
