export interface SEOMetaData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export const useSEO = () => {
  const config = useRuntimeConfig()
  const route = useRoute()

  const setMeta = (data: SEOMetaData) => {
    const fullTitle = `${data.title} - AgriTech Tunisia`
    const baseUrl = config.public.siteUrl || 'https://agritech.tn'
    const fullUrl = data.url || `${baseUrl}${route.path}`
    const defaultImage = `${baseUrl}/og-image.jpg`

    useHead({
      title: fullTitle,
      meta: [
        // Standard Meta Tags
        { name: 'description', content: data.description },
        { name: 'keywords', content: data.keywords?.join(', ') || '' },
        { name: 'author', content: data.author || 'AgriTech Tunisia' },

        // Open Graph Meta Tags (Facebook, LinkedIn)
        { property: 'og:type', content: data.type || 'website' },
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: data.description },
        { property: 'og:url', content: fullUrl },
        { property: 'og:image', content: data.image || defaultImage },
        { property: 'og:site_name', content: 'AgriTech Tunisia' },
        { property: 'og:locale', content: 'fr_TN' },

        // Twitter Card Meta Tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: fullTitle },
        { name: 'twitter:description', content: data.description },
        { name: 'twitter:image', content: data.image || defaultImage },

        // Article specific (if type is article)
        ...(data.type === 'article' && data.publishedTime
          ? [
              { property: 'article:published_time', content: data.publishedTime },
              ...(data.modifiedTime
                ? [{ property: 'article:modified_time', content: data.modifiedTime }]
                : []),
            ]
          : []),

        // Product specific (if type is product)
        ...(data.type === 'product'
          ? [{ property: 'product:availability', content: 'in stock' }]
          : []),
      ],
      link: [
        { rel: 'canonical', href: fullUrl },
      ],
    })
  }

  const setProductMeta = (product: {
    name: string
    description: string
    price: number
    image?: string
    category?: string
  }) => {
    setMeta({
      title: product.name,
      description: product.description,
      keywords: [product.name, product.category || 'agriculture', 'bio', 'tunisia'],
      image: product.image,
      type: 'product',
    })
  }

  const setArticleMeta = (article: {
    title: string
    description: string
    image?: string
    publishedAt?: string
    updatedAt?: string
  }) => {
    setMeta({
      title: article.title,
      description: article.description,
      image: article.image,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    })
  }

  return {
    setMeta,
    setProductMeta,
    setArticleMeta,
  }
}

// JSON-LD Schema markup
export const useStructuredData = () => {
  const setOrganizationSchema = () => {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AgriTech Tunisia',
            url: 'https://agritech.tn',
            logo: 'https://agritech.tn/logo.png',
            description: 'Marketplace agricole directe en Tunisie',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'TN',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'contact@agritech.tn',
              contactType: 'customer service',
            },
          }),
        },
      ],
    })
  }

  const setProductSchema = (product: any) => {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name_fr,
            description: product.description_fr,
            image: product.images?.[0],
            offers: {
              '@type': 'Offer',
              price: product.price_per_unit,
              priceCurrency: 'TND',
              availability: product.stock_available > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
            aggregateRating: product.rating_average > 0
              ? {
                  '@type': 'AggregateRating',
                  ratingValue: product.rating_average,
                  reviewCount: product.rating_count,
                }
              : undefined,
          }),
        },
      ],
    })
  }

  const setBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              item: item.url,
            })),
          }),
        },
      ],
    })
  }

  return {
    setOrganizationSchema,
    setProductSchema,
    setBreadcrumbSchema,
  }
}
