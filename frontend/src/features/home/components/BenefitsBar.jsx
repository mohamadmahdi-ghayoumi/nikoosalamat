import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'

export default function BenefitsBar({ benefits }) {
  return (
    <section className="benefits" aria-label="مزایای خرید از نیکو سلامت">
      {benefits.map((benefit) => (
        <div key={benefit.title}>
          <span className="benefit-icon">
            <Icon name={benefit.icon} />
          </span>
          <p>
            <strong>{benefit.title}</strong>
            <small>{benefit.description}</small>
          </p>
        </div>
      ))}
    </section>
  )
}
