import React, { useState } from 'react'
import Icon from '../ui/Icon.jsx'

export default function NavigationItem({ item, currentPath, navigate, depth = 0 }) {
  const hasChildren = Boolean(item.children?.length)
  const isActive = currentPath === item.path && (item.path === '/' || depth === 0)
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`nav-item nav-depth-${depth} ${hasChildren ? 'has-children' : ''} ${expanded ? 'expanded' : ''}`}
    >
      <div className="nav-row">
        <a
          className={`nav-link ${isActive ? 'active' : ''}`}
          href={item.path}
          onClick={(event) => navigate(event, item.path)}
        >
          <span>{item.label}</span>
        </a>
        {hasChildren && (
          <button
            className="submenu-toggle"
            type="button"
            aria-label={`نمایش زیرمنوی ${item.label}`}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <Icon name="chevron" size={14} />
          </button>
        )}
      </div>
      {hasChildren && (
        <div className="submenu" role="menu">
          {item.children.map((child) => (
            <NavigationItem
              key={`${item.label}-${child.label}`}
              item={child}
              currentPath={currentPath}
              navigate={navigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
