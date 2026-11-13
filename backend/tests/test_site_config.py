import copy
import pytest

from test_product_edit import editor, IMAGE
from test_support_php import php_site


@pytest.mark.parametrize('adapter',['editor','php_site'])
def test_site_customizer_drafts_auth_publish_restore_conflict_and_media(request,adapter):
    client,admin,_=request.getfixturevalue(adapter)
    public='/api/site-config'; api='/api/admin/site-config'
    assert client.get(public).json()=={'config':{},'revision':0}
    assert client.get(api).status_code==401
    for suffix,method in [('',client.put),('/publish',client.post),('/restore',client.post),('/text/home.test',client.put),('/media',client.post)]:
        assert method(api+suffix,json={}).status_code==401
    initial=client.get(api,headers=admin).json()
    config={'theme':{'primary':'#126234','font':'tahoma','cards':{'mobile':14},'heading':{'desktop':30,'mobile':18}},'texts':{'home.categories.title':{'text':'عنوان آزمایشی','font':'tahoma','color':'#112233','sizes':{'mobile':16}}},'navigation':[{'label':'خانه','path':'/','children':[{'label':'تماس','path':'/contact'}]}],'layouts':{'home':['hero','sample']},'blocks':{'sample':{'title':'بخش تازه','body':'<p><strong>متن</strong></p>','layout':'text'}},'pages':{'sample':{'title':'صفحه تازه','sections':['sample']}},'slides':[{'id':'slide-0','title':'عنوان','text':'متن','action':'بیشتر','path':'/about','image':'/images/photo.png','layout':'poster','fit':'contain'}]}
    saved=client.put(api,headers=admin,json={'revision':0,'config':config})
    assert saved.status_code==200,saved.text
    assert saved.json()['draft']==config
    assert client.get(public).json()['config']=={}
    assert '/site/sample' not in client.get('/sitemap.xml').text
    assert client.put(api,headers=admin,json={'revision':0,'config':{}}).status_code==409
    assert client.post(api+'/publish',headers=admin,json={'revision':0}).status_code==409
    published=client.post(api+'/publish',headers=admin,json={'revision':saved.json()['revision']})
    assert published.status_code==200,published.text
    assert client.get(public).json()=={'config':config,'revision':1}
    assert '/site/sample' in client.get('/sitemap.xml').text
    # A competing draft must survive an inline publication of the same field.
    draft=copy.deepcopy(config);draft['texts']['home.categories.title']['text']='متن پیش‌نویس خصوصی'
    state=client.put(api,headers=admin,json={'revision':published.json()['revision'],'config':draft}).json()
    inline=client.put(api+'/text/home.categories.title',headers=admin,json={'revision':1,'text':'متن مستقیم'})
    assert inline.status_code==200,inline.text
    assert inline.json()['config']['texts']['home.categories.title']['color']=='#112233'
    assert client.get(api,headers=admin).json()['draft']==draft
    assert client.put(api+'/text/home.categories.title',headers=admin,json={'revision':1,'text':'تب قدیمی'}).status_code==409
    assert client.post(api+'/publish',headers=admin,json={'revision':state['revision']}).status_code==409
    latest=client.get(api,headers=admin).json()
    restored=client.post(api+'/restore',headers=admin,json={'revision':latest['revision'],'history_id':initial['history'][0]['id']})
    assert restored.status_code==200,restored.text
    assert restored.json()['draft']=={}
    assert client.get(public).json()['config']['texts']['home.categories.title']['text']=='متن مستقیم'
    # Unsafe HTML may be stored as data in blocks, but executable URLs/CSS cannot be configured.
    for invalid in [
        {'theme':{'primary':'red;display:none'}},{'theme':{'heading':{'mobile':999}}},{'theme':{'font':'url(evil)'}},
        {'navigation':[{'label':'بد','path':'javascript:alert(1)'}]},
        {'images':{'photo':{'url':'data:image/svg+xml;base64,xxx'}}},
        {'links':{'link':'//evil.example'}},{'links':{'link':'/\\evil.example'}},
        {'navigation':[{'label':'یک','path':'/'},{'label':'یک','path':'/contact'}]},
        {'layouts':{'home':['hero','hero']}},{'pages':{'../bad':{'title':'بد','sections':[]}}},
        {'unknown':True},{'texts':[]},{'theme':{'radius':True}},
    ]:
        revision=client.get(api,headers=admin).json()['revision']
        response=client.put(api,headers=admin,json={'revision':revision,'config':invalid})
        assert response.status_code==422,(invalid,response.text)
    uploaded=client.post(api+'/media',headers=admin,json={'name':'نمونه.png','image_data':IMAGE})
    assert uploaded.status_code==201,uploaded.text
    assert uploaded.json()['url'].startswith('/uploads/')
    assert any(item['id']==uploaded.json()['id'] for item in client.get(api,headers=admin).json()['media'])
    assert client.post(api+'/media',headers=admin,json={'image_data':'data:image/png;base64,PGh0bWw+'}).status_code==422
    assert client.get(public).headers['cache-control']=='no-store'
    latest=client.get(api,headers=admin).json()
    assert client.post(api+'/restore',headers=admin,json={'revision':latest['revision'],'history_id':999999}).status_code==404
    for _ in range(22):
        latest=client.post(api+'/publish',headers=admin,json={'revision':latest['revision']}).json()
    assert len(latest['history'])==20
    assert all(item['id']!=initial['history'][0]['id'] for item in latest['history'])
    assert client.post(api+'/restore',headers=admin,json={'revision':latest['revision'],'history_id':initial['history'][0]['id']}).status_code==404
    styled=copy.deepcopy(latest['draft']);styled.setdefault('texts',{})['home.featured.title']={'color':'#445566'}
    assert client.put(api,headers=admin,json={'revision':latest['revision'],'config':styled}).status_code==200
    response=client.put(api+'/text/home.featured.title',headers=admin,json={'revision':latest['published_revision'],'text':'عنوان مستقیم تازه'})
    assert response.status_code==200,response.text
    pending=client.get(api,headers=admin).json()['draft']['texts']['home.featured.title']
    assert pending=={'color':'#445566','text':'عنوان مستقیم تازه'}
