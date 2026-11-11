import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { EditableText } from './HomeTextEditor.jsx'

export default function BenefitsBar({ benefits }) {
  return (
    <section className="benefits" aria-label="مزایای خرید از نیکو سلامت">
      {benefits.map((benefit, index) => (
        <div key={index}>
          <span className="benefit-icon">
            <Icon name={benefit.icon} />
          </span>
          <p>
            <strong>
              <EditableText field={`benefits.${index}.title`}>{benefit.title}</EditableText>
            </strong>
            <small>
              <EditableText field={`benefits.${index}.description`}>
                {benefit.description}
              </EditableText>
            </small>
          </p>
        </div>
      ))}
    </section>
  )
}
