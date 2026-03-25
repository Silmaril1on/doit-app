import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'de', 'ka'],
    defaultLocale: 'en', 
    localePrefix: "as-needed" // it ommits default prefix in url
})