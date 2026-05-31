import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/admin/', '/admin-login', '/admin-login/'],
        },
        host: 'https://www.rightspoon.co.kr',
        sitemap: 'https://www.rightspoon.co.kr/sitemap.xml',
    };
}
