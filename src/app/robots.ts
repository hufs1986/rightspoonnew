import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/admin-login/', '/admin/write/', '/admin/edit/'],
        },
        sitemap: 'https://www.rightspoon.co.kr/sitemap.xml',
    };
}
