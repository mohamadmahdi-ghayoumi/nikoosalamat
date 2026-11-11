import React, { useId } from 'react'
import Icon from '../ui/Icon.jsx'
import { desktopNavigation } from '../../hooks/useHeaderMenus.js'

export default function NavigationItem({
  item,
  currentPath,
  navigate,
  openPath,
  setOpenPath,
  parentPath = [],
  depth = 0,
}) {
  const hasChildren = Boolean(item.children?.length)
  const itemPath = item.path.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  const isActive =
    depth === 0 &&
    (currentPath === itemPath ||
      (itemPath !== '/' && currentPath.startsWith(`${itemPath}/`)) ||
      item.activePaths?.some((path) => currentPath === path || currentPath.startsWith(`${path}/`)))
  const submenuId = useId()
  const path = [...parentPath, item.label]
  const expanded = hasChildren && path.every((label, index) => openPath[index] === label)

  return (
    <div
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && desktopNavigation()) {
          setOpenPath(hasChildren ? path : parentPath)
        }
      }}
      className={`nav-item nav-depth-${depth} ${hasChildren ? 'has-children' : ''} ${expanded ? 'expanded' : ''}`}
    >
      <div className="nav-row">
        <a
          className={`nav-link ${isActive ? 'active' : ''}`}
          href={item.path}
          aria-current={isActive ? 'page' : undefined}
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
            aria-controls={submenuId}
            onClick={() => setOpenPath(expanded ? parentPath : path)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown') return
              event.preventDefault()
              setOpenPath(path)
              requestAnimationFrame(() =>
                document.getElementById(submenuId)?.querySelector('a')?.focus(),
              )
            }}
          >
            <Icon name="chevron" size={14} />
          </button>
        )}
      </div>
      {hasChildren && (
        <div className="submenu" id={submenuId} inert={!expanded}>
          {item.children.map((child) => (
            <NavigationItem
              key={`${item.label}-${child.label}`}
              item={child}
              currentPath={currentPath}
              navigate={navigate}
              depth={depth + 1}
              parentPath={path}
              openPath={openPath}
              setOpenPath={setOpenPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}
