export default async function run(page) {
  await page.setViewportSize({ width: 800, height: 500 })
  await page.waitForTimeout(150)
  return { ok: true }
}
