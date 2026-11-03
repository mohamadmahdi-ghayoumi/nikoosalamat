import React from 'react'
import ArticleForm from './ArticleForm.jsx'
import ArticleList from './ArticleList.jsx'

export default function ArticlesManager({
  busy,
  articles,
  editingArticle,
  setEditingArticle,
  saveArticle,
  removeArticle,
}) {
  return (
    <div className="admin-layout admin-articles-layout">
      <ArticleForm
        busy={busy}
        editingArticle={editingArticle}
        setEditingArticle={setEditingArticle}
        saveArticle={saveArticle}
      />
      <ArticleList
        articles={articles}
        setEditingArticle={setEditingArticle}
        removeArticle={removeArticle}
      />
    </div>
  )
}
