/**
 * Our API wraps Laravel paginators as { success, message, data: <paginator> },
 * where <paginator> = { data: [...items], current_page, last_page, total, ... }.
 * This flattens that into { items, meta } for components to consume.
 */
export function unwrapPaginated(apiResponse) {
  const paginator = apiResponse?.data
  if (!paginator) return { items: [], meta: null }

  const { data: items = [], ...meta } = paginator
  return { items, meta }
}
