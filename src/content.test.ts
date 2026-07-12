import { describe, expect, it } from 'vitest'
import { siteContent } from './content'

describe('site content', () => {
  it('preserves the supplied business contact and pickup locations', () => {
    expect(siteContent.phone.display).toBe('+48 514 574 594')
    expect(siteContent.pickupLocations).toEqual(['Galewice', 'Łęka Mroczeńska'])
  })

  it('contains the PDF vehicle specifications', () => {
    expect(siteContent.vehicles).toHaveLength(2)
    expect(siteContent.vehicles[0].specs).toContain('1.6 dCi BiTurbo (125 KM)')
    expect(siteContent.vehicles[1].equipment).toContain('Hak holowniczy')
  })

  it('contains every rate and marks testimonials as placeholders', () => {
    expect(siteContent.pricing.map((tier) => tier.price)).toEqual([300, 250, 200, 180])
    expect(siteContent.testimonials.every((item) => item.placeholder)).toBe(true)
  })
})
