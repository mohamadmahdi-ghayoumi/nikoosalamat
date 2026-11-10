import React from 'react'
import { request } from '../../services/api/client.js'

export const messageId = () => crypto.randomUUID().replaceAll('-', '')
export const supportRequest = (path, options = {}, session = null, adminToken = null) => request(
  `/api/${adminToken ? 'admin/' : ''}support${path}`,
  { ...options, headers: {
    ...(session ? { 'X-Support-Token': session.token } : {}),
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
  } },
)

export const messageTime = (seconds) => new Date(seconds * 1000).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })

export function MessageList({ messages, visitorLabel = 'شما' }) {
  return messages.map((message) => (
    <div className={`support-message support-message--${message.role}`} key={message.id}>
      <span className="support-sender">{message.role === 'staff' ? 'پشتیبانی' : visitorLabel}</span>
      <p dir="auto">{message.text}</p>
      <time dateTime={new Date(message.created_at * 1000).toISOString()}>{messageTime(message.created_at)}</time>
    </div>
  ))
}
