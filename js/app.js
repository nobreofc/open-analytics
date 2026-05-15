/* ═══════════════════════════════════════════════
   OPEN ANALYTICS — App Core (app.js)
   State: localStorage (Netlify Identity + Supabase ready)
   ═══════════════════════════════════════════════ */

const OA = (() => {

  /* ─── STATE ─────────────────────────────────── */
  let state = {
    user: null,
    cart: [],
    products: [],
    orders: [],
    page: 'home',
  };

  /* ─── STORAGE HELPERS ───────────────────────── */
  const store = {
    get: (k, def = null) => { try { const v = localStorage.getItem('oa_' + k); return v ? JSON.parse(v) : def; } catch { return def; } },
    set: (k, v) => { try { localStorage.setItem('oa_' + k, JSON.stringify(v)); } catch {} },
    del: (k) => localStorage.removeItem('oa_' + k),
  };

  /* ─── INITIAL DATA (demo products) ─────────── */
  const DEFAULT_PRODUCTS = [
    { id: 'p1', name: 'Site Imobiliária Premium', category: 'site', emoji: '🏠',
      price: 297, oldPrice: 497, desc: 'Site completo para imobiliária com busca de imóveis, cadastro de corretores, integração WhatsApp e painel admin.',
      features: ['Landing Page responsiva','Painel de imóveis','Integração WhatsApp','SEO otimizado','Suporte 30 dias'],
      badge: 'Mais vendido', files: [{ name: 'imobiliaria-premium-v2.zip', size: '8.4 MB' }], active: true },
    { id: 'p2', name: 'Dashboard Financeiro Excel', category: 'excel', emoji: '📊',
      price: 197, oldPrice: 347, desc: 'Controle financeiro completo: DRE automático, fluxo de caixa, contas a pagar/receber, gráficos interativos.',
      features: ['DRE automático','Fluxo de caixa','Charts interativos','Fórmulas protegidas','Manual PDF incluso'],
      badge: 'Novo', files: [{ name: 'dashboard-financeiro-v3.xlsx', size: '2.1 MB' }, { name: 'manual.pdf', size: '1.2 MB' }], active: true },
    { id: 'p3', name: 'Site Clínica Médica', category: 'site', emoji: '🏥',
      price: 247, oldPrice: 397, desc: 'Presença digital profissional para clínicas: agendamento online, perfil de médicos, depoimentos e LGPD inclusa.',
      features: ['Agendamento online','Perfil de médicos','Blog integrado','LGPD compliant','SSL grátis'],
      badge: null, files: [{ name: 'clinica-medica-v1.zip', size: '6.7 MB' }], active: true },
    { id: 'p4', name: 'Gestão de Estoque Excel', category: 'excel', emoji: '📦',
      price: 147, oldPrice: 247, desc: 'Controle de estoque com entrada/saída, alertas de mínimo, código de barras, relatórios automáticos e inventário.',
      features: ['Entrada e saída','Alertas automáticos','Código de barras','Relatórios PDF','Suporte via e-mail'],
      badge: null, files: [{ name: 'estoque-v4.xlsx', size: '1.8 MB' }], active: true },
    { id: 'p5', name: 'Site E-commerce Completo', category: 'site', emoji: '🛒',
      price: 497, oldPrice: 797, desc: 'Loja virtual completa com carrinho, checkout, integração MercadoPago, painel de pedidos e gestão de produtos.',
      features: ['Carrinho de compras','MercadoPago integrado','Gestão de produtos','Relatório de vendas','1 ano de suporte'],
      badge: 'Premium', files: [{ name: 'ecommerce-v2.zip', size: '14.2 MB' }, { name: 'setup-guide.pdf', size: '2.8 MB' }], active: true },
    { id: 'p6', name: 'CRM de Vendas Excel', category: 'excel', emoji: '🎯',
      price: 167, oldPrice: 297, desc: 'CRM completo para equipe comercial: funil de vendas, follow-up, metas, comissões e relatório de desempenho.',
      features: ['Funil de vendas','Follow-up automático','Controle de metas','Cálculo de comissão','Dashboard executivo'],
      badge: null, files: [{ name: 'crm-vendas-v2.xlsx', size: '2.4 MB' }], active: true },
  ];

  /* ─── INIT ──────────────────────────────────── */
  function init() {
    state.user = store.get('user');
    state.cart = store.get('cart', []);
    state.orders = store.get('orders', []);
    const savedProducts = store.get('products');
    state.products = savedProducts && savedProducts.length ? savedProducts : DEFAULT_PRODUCTS;
    if (!savedProducts || !savedProducts.length) store.set('products', DEFAULT_PRODUCTS);

    createParticles();
    renderNav();
    setupRouter();
    window.addEventListener('popstate', handleRoute);
    handleRoute();
    hideLoader();
  }

  /* ─── PARTICLES ─────────────────────────────── */
  function createParticles() {
    const bg = document.getElementById('particles-bg');
    if (!bg) return;
    const colors = ['rgba(21,101,192,0.6)', 'rgba(255,109,0,0.5)', 'rgba(66,165,245,0.4)'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 3 + Math.random() * 6;
      p.style.cssText = `
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;top:${Math.random() * 100}%;
        background:${colors[i % colors.length]};
        --dur:${5 + Math.random() * 8}s;
        --delay:${Math.random() * 4}s;
        --op:${0.3 + Math.random() * 0.4};
        --tx:${(Math.random() - 0.5) * 80}px;
        --ty:${(Math.random() - 0.5) * 80}px;
      `;
      bg.appendChild(p);
    }
  }

  /* ─── NAV ───────────────────────────────────── */
  function renderNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    nav.innerHTML = `
      <div class="nav-logo" onclick="OA.go('home')">
        <img src="assets/logo.jpg" alt="Open Analytics">
      </div>
      <div class="nav-links" id="nav-links">
        <a href="#" onclick="OA.go('home');return false;" class="${state.page==='home'?'active':''}">Início</a>
        <a href="#" onclick="OA.go('products');return false;" class="${state.page==='products'?'active':''}">Produtos</a>
        <a href="#" onclick="OA.go('about');return false;" class="${state.page==='about'?'active':''}">Sobre</a>
      </div>
      <div class="nav-actions">
        ${state.user ? `
          <div class="nav-user" onclick="OA.go('dashboard')">
            <div class="nav-avatar">${state.user.name.charAt(0).toUpperCase()}</div>
            <span class="nav-user-name">${state.user.name.split(' ')[0]}</span>
          </div>
          ${state.user.isAdmin ? `<button class="btn-primary" onclick="OA.go('admin')">⚙ Admin</button>` : ''}
          <button class="btn-ghost" onclick="OA.logout()">Sair</button>
        ` : `
          <button class="btn-ghost" onclick="OA.openLogin()">Entrar</button>
          <button class="btn-primary" onclick="OA.openRegister()">Criar conta</button>
        `}
        <div class="cart-btn" onclick="OA.openCart()" title="Carrinho" style="cursor:pointer;position:relative;padding:8px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;display:flex;align-items:center;gap:6px;font-size:14px;">
          🛒 <span id="cart-count" style="color:var(--orange);font-weight:700">${state.cart.length}</span>
        </div>
      </div>
    `;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  /* ─── ROUTER ────────────────────────────────── */
  function setupRouter() {}
  function handleRoute() {
    const hash = location.hash.replace('#', '') || 'home';
    go(hash, false);
  }
  function go(page, pushState = true) {
    state.page = page;
    if (pushState) history.pushState({}, '', '#' + page);
    renderNav();
    renderPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderPage(page) {
    const app = document.getElementById('app');
    if (!app) return;
    switch (page) {
      case 'home':      app.innerHTML = pageHome(); bindHome(); break;
      case 'products':  app.innerHTML = pageProducts(); bindProducts(); break;
      case 'dashboard': app.innerHTML = pageDashboard(); break;
      case 'admin':     app.innerHTML = pageAdmin(); bindAdmin(); break;
      case 'downloads': app.innerHTML = pageDownloads(); break;
      case 'about':     app.innerHTML = pageAbout(); break;
      default:          app.innerHTML = pageHome(); bindHome();
    }
  }

  /* ═══════════════════════════════════════════════
     PAGE: HOME
  ═══════════════════════════════════════════════ */
  function pageHome() {
    return `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">✦ Plataforma #1 em Soluções Digitais</div>
        <h1 class="hero-title">
          Transforme seu negócio com<br>
          <span class="grad-blue">sites</span> e <span class="grad-orange">sistemas</span><br>
          prontos para usar
        </h1>
        <p class="hero-sub">Sites profissionais e sistemas Excel para impulsionar suas vendas. Compre, baixe e use hoje mesmo.</p>
        <div class="hero-btns">
          <button class="btn-orange btn-hero" onclick="OA.go('products')">🛒 Ver produtos</button>
          <button class="btn-ghost btn-hero" onclick="OA.openRegister()">Criar conta grátis</button>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><div class="hero-stat-num">120<span>+</span></div><div class="hero-stat-label">Clientes satisfeitos</div></div>
          <div class="hero-divider"></div>
          <div class="hero-stat"><div class="hero-stat-num">6<span>+</span></div><div class="hero-stat-label">Produtos premium</div></div>
          <div class="hero-divider"></div>
          <div class="hero-stat"><div class="hero-stat-num">4.9<span>★</span></div><div class="hero-stat-label">Avaliação média</div></div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section style="padding:64px 48px;position:relative;z-index:2;">
      <div class="container">
        <div class="section-center" style="margin-bottom:48px;">
          <div class="section-overline">Por que escolher a Open Analytics</div>
          <h2 class="section-title">Soluções completas,<br>entrega imediata</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feat-icon-wrap">⚡</div>
            <div class="feat-title">Entrega instantânea</div>
            <div class="feat-desc">Pague e baixe na hora. Sem espera, sem fila. Acesso imediato após confirmação do pagamento.</div>
          </div>
          <div class="feature-card">
            <div class="feat-icon-wrap">🔒</div>
            <div class="feat-title">Pagamento seguro</div>
            <div class="feat-desc">Cartão de crédito, Pix ou boleto bancário. Ambiente 100% seguro e criptografado.</div>
          </div>
          <div class="feature-card">
            <div class="feat-icon-wrap">📞</div>
            <div class="feat-title">Suporte incluído</div>
            <div class="feat-desc">Cada produto vem com período de suporte técnico. Tire suas dúvidas via e-mail ou WhatsApp.</div>
          </div>
          <div class="feature-card">
            <div class="feat-icon-wrap">🔄</div>
            <div class="feat-title">Atualizações grátis</div>
            <div class="feat-desc">Compradores recebem atualizações gratuitas por 12 meses. Sempre na versão mais recente.</div>
          </div>
          <div class="feature-card">
            <div class="feat-icon-wrap">📱</div>
            <div class="feat-title">100% responsivo</div>
            <div class="feat-desc">Sites otimizados para celular, tablet e desktop. Carregamento ultrarrápido.</div>
          </div>
          <div class="feature-card">
            <div class="feat-icon-wrap">📊</div>
            <div class="feat-title">Analytics integrado</div>
            <div class="feat-desc">Todos os sites já vêm com Google Analytics configurado. Monitore suas visitas.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRODUTOS DESTAQUE -->
    <section style="padding:64px 48px;position:relative;z-index:2;background:rgba(255,255,255,0.02);">
      <div class="container">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
          <div>
            <div class="section-overline">Produtos em destaque</div>
            <h2 class="section-title" style="margin-bottom:0">Os mais vendidos</h2>
          </div>
          <button class="btn-ghost" onclick="OA.go('products')">Ver todos →</button>
        </div>
        <div class="products-grid" id="home-products"></div>
      </div>
    </section>

    <!-- CTA -->
    <section style="padding:96px 48px;position:relative;z-index:2;text-align:center;">
      <div style="max-width:600px;margin:0 auto;background:rgba(21,101,192,0.08);border:1px solid rgba(21,101,192,0.2);border-radius:24px;padding:60px 40px;">
        <h2 class="section-title" style="margin-bottom:16px">Pronto para começar?</h2>
        <p style="color:var(--gray2);font-size:16px;margin-bottom:32px;line-height:1.7">Crie sua conta gratuita e tenha acesso imediato a todos os produtos após a compra.</p>
        <button class="btn-orange" style="padding:16px 40px;font-size:16px;font-weight:700;border-radius:12px;" onclick="OA.openRegister()">🚀 Criar conta grátis</button>
      </div>
    </section>`;
  }

  function bindHome() {
    const grid = document.getElementById('home-products');
    if (!grid) return;
    const featured = state.products.filter(p => p.active).slice(0, 3);
    grid.innerHTML = featured.map(renderProductCard).join('');
    animateOnScroll();
  }

  /* ═══════════════════════════════════════════════
     PAGE: PRODUCTS
  ═══════════════════════════════════════════════ */
  function pageProducts() {
    return `
    <div style="padding:120px 48px 80px;position:relative;z-index:2;">
      <div class="container">
        <div style="margin-bottom:40px;">
          <div class="section-overline">Catálogo</div>
          <h1 class="section-title">Todos os produtos</h1>
          <p style="color:var(--gray2);font-size:16px;margin-top:8px;">Sites profissionais e sistemas Excel para o seu negócio.</p>
        </div>
        <div class="products-filters">
          <button class="filter-btn active" data-filter="all">Todos</button>
          <button class="filter-btn" data-filter="site">🌐 Sites</button>
          <button class="filter-btn" data-filter="excel">📊 Excel</button>
        </div>
        <div class="products-grid" id="all-products"></div>
      </div>
    </div>`;
  }

  function bindProducts() {
    renderAllProducts('all');
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAllProducts(btn.dataset.filter);
      });
    });
  }

  function renderAllProducts(filter) {
    const grid = document.getElementById('all-products');
    if (!grid) return;
    const list = state.products.filter(p => p.active && (filter === 'all' || p.category === filter));
    grid.innerHTML = list.length ? list.map(renderProductCard).join('') : '<p style="color:var(--gray2);grid-column:1/-1;padding:40px;text-align:center;">Nenhum produto encontrado.</p>';
  }

  function renderProductCard(p) {
    return `
    <div class="product-card" id="pc-${p.id}">
      <div class="product-img">
        <span style="font-size:64px">${p.emoji||'📦'}</span>
        ${p.badge ? `<div class="product-badge ${p.badge==='Novo'?'new':''}">${p.badge}</div>` : ''}
      </div>
      <div class="product-body">
        <div class="product-category">${p.category === 'site' ? '🌐 Site' : '📊 Excel'}</div>
        <div class="product-name">${p.name||''}</div>
        <div class="product-desc">${p.desc||p.description||''}</div>
        <ul style="list-style:none;margin-bottom:16px;">${(Array.isArray(p.features)?p.features:[]).slice(0,3).map(f=>`<li style="font-size:12px;color:var(--gray2);padding:3px 0;"><span style="color:var(--blue-light);margin-right:6px;">✓</span>${f}</li>`).join('')}</ul>
        <div class="product-footer">
          <div class="product-price">
            ${p.oldPrice ? `<div class="from">R$ ${(parseFloat(p.oldPrice)||0).toFixed(2)}</div>` : ''}
            R$ ${(parseFloat(p.price)||0).toFixed(2)}
            <small>pagamento único</small>
          </div>
          <button class="btn-buy" onclick="OA.openProduct('${p.id}')">Ver detalhes</button>
        </div>
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     PRODUCT DETAIL MODAL
  ═══════════════════════════════════════════════ */
  function openProduct(id) {
    try {
      const p = state.products.find(x => x.id === id);
      if (!p) { toast('Produto não encontrado.', 'error'); return; }

      // Garantir que features e files sejam arrays válidos
      const features = Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? p.features.split('\n').filter(Boolean) : []);
      const files = Array.isArray(p.files) ? p.files : [];
      const price = parseFloat(p.price) || 0;
      const oldPrice = parseFloat(p.oldPrice) || 0;
      const emoji = p.emoji || '📦';
      const name = p.name || 'Produto';
      const desc = p.desc || p.description || '';
      const cat = p.category === 'site' ? '🌐 Site' : '📊 Excel';

      const featuresHTML = features.length
        ? features.map(f => `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;"><span style="color:var(--blue-light)">✓</span>${f}</div>`).join('')
        : '<div style="font-size:13px;color:var(--gray2);padding:8px 0;">Consulte a descrição do produto.</div>';

      const filesHTML = files.length
        ? files.map(f => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:6px;font-size:13px;"><span>📄 ${f.name||f}</span><span style="color:var(--gray2)">${f.size||''}</span></div>`).join('')
        : '<div style="font-size:13px;color:var(--gray2);padding:8px 0;">Arquivos disponíveis após a compra.</div>';

      showModal(`
        <div class="modal-header">
          <div>
            <div style="font-size:11px;color:var(--blue-light);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${cat}</div>
            <div class="modal-title">${name}</div>
          </div>
          <button class="modal-close" onclick="OA.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="font-size:64px;text-align:center;padding:20px 0;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:20px;">${emoji}</div>
          <p style="font-size:14px;color:var(--gray2);line-height:1.7;margin-bottom:20px;">${desc}</p>
          <div style="margin-bottom:20px;">
            <div style="font-size:12px;font-weight:700;color:var(--gray2);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;">O que está incluso</div>
            ${featuresHTML}
          </div>
          <div style="margin-bottom:20px;">
            <div style="font-size:12px;font-weight:700;color:var(--gray2);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;">Arquivos inclusos</div>
            ${filesHTML}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;background:rgba(21,101,192,0.08);border:1px solid rgba(21,101,192,0.2);border-radius:12px;margin-bottom:20px;">
            <div>
              ${oldPrice > 0 ? `<div style="font-size:13px;color:var(--gray);text-decoration:line-through;">R$ ${oldPrice.toFixed(2)}</div>` : ''}
              <div style="font-size:32px;font-weight:800;">R$ ${price.toFixed(2)}</div>
              <div style="font-size:12px;color:var(--gray2)">pagamento único</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:11px;color:var(--gray2)">ou</div>
              <div style="font-size:18px;font-weight:700;color:var(--orange)">3x R$ ${(price/3).toFixed(2)}</div>
              <div style="font-size:11px;color:var(--gray2)">sem juros</div>
            </div>
          </div>
          <button class="btn-orange btn-block" onclick="OA.addToCartAndBuy('${p.id}')">🛒 Comprar agora</button>
          <button class="btn-ghost btn-block" style="margin-top:10px;" onclick="OA.addToCart('${p.id}');OA.closeModal();OA.toast('Adicionado ao carrinho!','success');">Adicionar ao carrinho</button>
        </div>
      `);
    } catch(err) {
      console.error('openProduct error:', err);
      toast('Erro ao abrir produto. Tente novamente.', 'error');
    }
  }

  /* ═══════════════════════════════════════════════
     CART
  ═══════════════════════════════════════════════ */
  function addToCart(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    if (!state.cart.find(c => c.id === id)) {
      state.cart.push({ id, name: p.name, price: p.price, emoji: p.emoji });
      store.set('cart', state.cart);
    }
    renderNav();
  }

  function addToCartAndBuy(id) {
    addToCart(id);
    // Abre checkout diretamente no mesmo modal — sem piscar
    openCheckoutInModal();
  }

  function openCart() {
    if (!state.cart.length) { toast('Seu carrinho está vazio.', 'info'); return; }
    const total = state.cart.reduce((s, i) => s + i.price, 0);
    showModal(`
      <div class="modal-header">
        <div class="modal-title">🛒 Carrinho</div>
        <button class="modal-close" onclick="OA.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        ${state.cart.map(item => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);">
            <span style="font-size:28px">${item.emoji}</span>
            <div style="flex:1"><div style="font-size:14px;font-weight:600">${item.name}</div><div style="font-size:13px;color:var(--orange)">R$ ${item.price.toFixed(2)}</div></div>
            <button onclick="OA.removeFromCart('${item.id}')" style="background:rgba(239,68,68,0.15);border:none;color:#ef4444;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px;">✕</button>
          </div>`).join('')}
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;padding:16px 0;">
          <span>Total</span><span style="color:var(--orange)">R$ ${total.toFixed(2)}</span>
        </div>
        <button class="btn-orange btn-block" onclick="OA.openCheckoutInModal()">🛒 Finalizar compra</button>
      </div>
    `);
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(c => c.id !== id);
    store.set('cart', state.cart);
    renderNav();
    openCart();
  }

  /* ═══════════════════════════════════════════════
     CHECKOUT / PAYMENT
  ═══════════════════════════════════════════════ */
  function openCheckoutInModal() {
    // Garante que o usuário está logado
    if (!state.user) {
      switchModal ? switchModal(buildLoginHTML()) : showModal(buildLoginHTML());
      bindLoginForm();
      return;
    }
    if (!state.cart.length) { toast('Carrinho vazio. Adicione um produto primeiro.', 'info'); return; }
    const html = buildCheckoutHTML();
    const box = document.getElementById('modal-box');
    if (box) {
      switchModal(html);
    } else {
      showModal(html);
    }
  }

  function buildLoginHTML() {
    return '<div class="modal-header">'
      + '<div class="modal-title">🔐 Entre para continuar</div>'
      + '<button class="modal-close" onclick="OA.closeModal()">✕</button>'
      + '</div>'
      + '<div class="modal-body">'
      + '<p class="modal-sub">Faça login ou crie sua conta para finalizar a compra.</p>'
      + '<div class="form-group"><label class="form-label">E-mail</label>'
      + '<input class="form-input" id="login-email" type="email" placeholder="seu@email.com"></div>'
      + '<div class="form-group"><label class="form-label">Senha</label>'
      + '<input class="form-input" id="login-pass" type="password" placeholder="••••••••"></div>'
      + '<div id="login-err" class="form-error hidden"></div>'
      + '<button class="btn-primary btn-block" id="login-btn" onclick="OA.doLogin(true)">Entrar</button>'
      + '<div class="switch-text" style="margin-top:16px;">Não tem conta? <a onclick="OA.openRegister()">Criar conta grátis</a></div>'
      + '</div>';
  }

  function buildCheckoutHTML() {
    if (!state.cart.length) return '';
    var total = state.cart.reduce(function(s,i){ return s + (parseFloat(i.price)||0); }, 0);
    var bank = store.get('bank') || {};
    var pixKey = bank.pix || 'openanalytics@pagamento.com.br';
    var boletoNum = Math.round(total*100).toString();
    while(boletoNum.length < 8) boletoNum = '0' + boletoNum;
    var boletoCode = '0001.23456 7890.12345 67890.12345 6 000' + boletoNum;
    var t  = total.toFixed(2);
    var t2 = (total/2).toFixed(2);
    var t3 = (total/3).toFixed(2);
    var itemsHTML = state.cart.map(function(i){
      return '<div class="order-row"><span>'+(i.emoji||'📦')+' '+i.name+'</span><span>R$ '+(parseFloat(i.price)||0).toFixed(2)+'</span></div>';
    }).join('');
    var div = document.createElement('div');
    div.innerHTML = [
      '<div class="modal-header">',
        '<div class="modal-title">💳 Finalizar compra</div>',
        '<button class="modal-close" onclick="OA.closeModal()">✕</button>',
      '</div>',
      '<div class="modal-body">',
        '<div class="order-summary">',
          itemsHTML,
          '<div class="order-row total"><span>Total</span><span class="price">R$ '+t+'</span></div>',
        '</div>',
        '<div class="payment-tabs" id="pay-tabs"></div>',
        '<div id="pay-card">',
          '<div class="form-group">',
            '<label class="form-label">Número do cartão</label>',
            '<input class="form-input" id="cc-num" placeholder="0000 0000 0000 0000" maxlength="19" oninput="OA.fmtCC(this)">',
          '</div>',
          '<div class="form-row">',
            '<div class="form-group"><label class="form-label">Validade</label><input class="form-input" id="cc-exp" placeholder="MM/AA" maxlength="5" oninput="OA.fmtExp(this)"></div>',
            '<div class="form-group"><label class="form-label">CVV</label><input class="form-input" id="cc-cvv" placeholder="000" maxlength="4" type="password"></div>',
          '</div>',
          '<div class="form-group"><label class="form-label">Nome no cartão</label><input class="form-input" id="cc-name" placeholder="NOME SOBRENOME" style="text-transform:uppercase"></div>',
          '<div class="form-group"><label class="form-label">Parcelamento</label>',
            '<select class="form-input" id="cc-parc">',
              '<option>1x R$ '+t+' (à vista)</option>',
              '<option>2x R$ '+t2+' sem juros</option>',
              '<option>3x R$ '+t3+' sem juros</option>',
            '</select>',
          '</div>',
          '<button class="btn-orange btn-block" id="pay-btn" onclick="OA.processPayment(\"card\")">🔒 Pagar R$ '+t+'</button>',
        '</div>',
        '<div id="pay-pix" class="hidden">',
          '<div class="pix-area" style="text-align:center;">',
            '<div style="font-size:72px;padding:16px 0;">⚡</div>',
            '<div style="font-size:13px;color:var(--gray2);margin-bottom:8px;">Copie a chave Pix e pague no seu banco</div>',
            '<div class="pix-key" id="pix-key-display">'+pixKey+'</div>',
            '<button class="btn-primary btn-block" style="margin-top:8px;" id="copy-pix-btn">📋 Copiar chave Pix</button>',
            '<div style="margin-top:12px;font-size:14px;">Valor: <strong style="color:var(--orange)">R$ '+t+'</strong></div>',
          '</div>',
          '<div style="margin-top:16px;padding:12px;background:rgba(255,193,7,0.08);border:1px solid rgba(255,193,7,0.3);border-radius:10px;font-size:13px;color:#ffc107;">',
            '⏳ Após pagar, envie o comprovante para openanalytics@gmail.com. Acesso liberado em até 5 minutos.',
          '</div>',
          '<button class="btn-orange btn-block" style="margin-top:16px;" onclick="OA.processPayment(\"pix\")">✅ Já paguei via Pix</button>',
        '</div>',
        '<div id="pay-boleto" class="hidden">',
          '<div style="text-align:center;padding:12px 0;">',
            '<div style="font-size:48px;">🏦</div>',
            '<div style="font-size:15px;font-weight:700;margin:8px 0;">Boleto Bancário</div>',
            '<div style="font-size:13px;color:var(--gray2);margin-bottom:12px;">Vencimento em 3 dias úteis</div>',
            '<div class="boleto-code" id="boleto-code-display">'+boletoCode+'</div>',
            '<button class="btn-ghost btn-block" id="copy-boleto-btn">📋 Copiar código de barras</button>',
          '</div>',
          '<div style="margin-top:12px;padding:12px;background:rgba(255,109,0,0.08);border:1px solid rgba(255,109,0,0.2);border-radius:10px;font-size:13px;color:var(--gray2);">',
            '⚠️ O acesso é liberado após confirmação do pagamento (1 a 3 dias úteis).',
          '</div>',
          '<button class="btn-orange btn-block" style="margin-top:16px;" onclick="OA.processPayment(\"boleto\")">🖨 Gerar boleto</button>',
        '</div>',
      '</div>'
    ].join('');

    // Build tabs separately to avoid quote issues
    var tabs = div.getElementById('pay-tabs');
    var tabCard = document.createElement('button');
    tabCard.className = 'pay-tab active';
    tabCard.textContent = '💳 Cartão';
    tabCard.onclick = function(){ OA.switchPayTab(this,'card'); };
    var tabPix = document.createElement('button');
    tabPix.className = 'pay-tab';
    tabPix.textContent = '⚡ Pix';
    tabPix.onclick = function(){ OA.switchPayTab(this,'pix'); };
    var tabBoleto = document.createElement('button');
    tabBoleto.className = 'pay-tab';
    tabBoleto.textContent = '🏦 Boleto';
    tabBoleto.onclick = function(){ OA.switchPayTab(this,'boleto'); };
    if(tabs){ tabs.appendChild(tabCard); tabs.appendChild(tabPix); tabs.appendChild(tabBoleto); }

    // Copy buttons
    var copyPix = div.getElementById('copy-pix-btn');
    if(copyPix){ copyPix.onclick = function(){ navigator.clipboard.writeText(pixKey).then(function(){ OA.toast('Chave Pix copiada!','success'); }); }; }
    var copyBoleto = div.getElementById('copy-boleto-btn');
    if(copyBoleto){ copyBoleto.onclick = function(){ navigator.clipboard.writeText(boletoCode).then(function(){ OA.toast('Código copiado!','success'); }); }; }

    return div.innerHTML;
  }
  function openCheckout() {
    if (!state.user) { openLogin(); return; }
    if (!state.cart.length) { toast('Carrinho vazio.', 'info'); return; }
    showModal(buildCheckoutHTML());
  }


  function switchPayTab(btn, type) {
    document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    ['card', 'pix', 'boleto'].forEach(t => {
      const el = document.getElementById('pay-' + t);
      if (el) el.classList.toggle('hidden', t !== type);
    });
  }

  function fmtCC(el) {
    el.value = el.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  }
  function fmtExp(el) {
    let v = el.value.replace(/\D/g, '');
    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
    el.value = v;
  }

  function processPayment(method) {
    if (method === 'card') {
      const num = document.getElementById('cc-num')?.value.replace(/\s/g, '') || '';
      const name = document.getElementById('cc-name')?.value || '';
      const exp = document.getElementById('cc-exp')?.value || '';
      const cvv = document.getElementById('cc-cvv')?.value || '';
      if (num.length < 16 || !name || exp.length < 5 || cvv.length < 3) {
        toast('Preencha todos os dados do cartão.', 'error'); return;
      }
    }
    const btn = document.getElementById('pay-btn');
    if (btn) { btn.innerHTML = '<div class="loading-spinner"></div> Processando...'; btn.disabled = true; }

    setTimeout(() => {
      const order = {
        id: 'OA-' + Date.now(),
        items: [...state.cart],
        total: state.cart.reduce((s, i) => s + i.price, 0),
        method,
        status: method === 'card' ? 'approved' : 'pending',
        date: new Date().toISOString(),
        user: state.user.email,
      };
      state.orders.push(order);
      store.set('orders', state.orders);

      if (method === 'boleto') {
        closeModal();
        toast('Boleto gerado! Pague até o vencimento.', 'info');
        state.cart = []; store.set('cart', state.cart); renderNav();
        return;
      }

      state.cart = [];
      store.set('cart', state.cart);
      renderNav();
      closeModal();

      showModal(`
        <div class="modal-header" style="justify-content:center;flex-direction:column;text-align:center;padding-bottom:0;">
          <div style="font-size:64px;margin-bottom:8px;">🎉</div>
          <div class="modal-title">Pagamento aprovado!</div>
        </div>
        <div class="modal-body" style="text-align:center;">
          <p style="color:var(--gray2);margin-bottom:8px;">Pedido <strong style="color:var(--white)">${order.id}</strong></p>
          <p style="color:var(--gray2);font-size:14px;margin-bottom:24px;">Seus arquivos estão disponíveis para download imediatamente.</p>
          <button class="btn-primary btn-block" style="margin-bottom:10px;" onclick="OA.closeModal();OA.go('downloads')">📥 Acessar downloads</button>
          <button class="btn-ghost btn-block" onclick="OA.closeModal()">Continuar comprando</button>
        </div>
      `);
    }, method === 'card' ? 2200 : 800);
  }

  /* ═══════════════════════════════════════════════
     AUTH MODALS
  ═══════════════════════════════════════════════ */
  function openLogin() {
    showModal(`
      <div class="modal-header">
        <div class="modal-title">Entrar na sua conta</div>
        <button class="modal-close" onclick="OA.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <p class="modal-sub">Acesse seus produtos e histórico de pedidos.</p>
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="form-input" id="login-email" type="email" placeholder="seu@email.com">
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input class="form-input" id="login-pass" type="password" placeholder="••••••••">
        </div>
        <div id="login-err" class="form-error hidden"></div>
        <button class="btn-primary btn-block" id="login-btn" onclick="OA.doLogin()">Entrar</button>
        <div class="switch-text">Não tem conta? <a onclick="OA.openRegister()">Criar conta grátis</a></div>
      </div>
    `);
  }

  function openRegister() {
    showModal(`
      <div class="modal-header">
        <div class="modal-title">Criar sua conta</div>
        <button class="modal-close" onclick="OA.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <p class="modal-sub">Cadastro único e gratuito. Acesse seus produtos a qualquer hora.</p>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input class="form-input" id="reg-name" placeholder="Seu nome">
          </div>
          <div class="form-group">
            <label class="form-label">Sobrenome</label>
            <input class="form-input" id="reg-last" placeholder="Sobrenome">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="form-input" id="reg-email" type="email" placeholder="seu@email.com">
          <div class="form-hint">Será usado para login e receber confirmações de compra.</div>
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input class="form-input" id="reg-pass" type="password" placeholder="Mínimo 6 caracteres">
        </div>
        <div class="form-group">
          <label class="form-label">Confirmar senha</label>
          <input class="form-input" id="reg-pass2" type="password" placeholder="Repita a senha">
        </div>
        <div id="reg-err" class="form-error hidden"></div>
        <button class="btn-orange btn-block" id="reg-btn" onclick="OA.doRegister()">🚀 Criar minha conta</button>
        <div class="switch-text">Já tem conta? <a onclick="OA.openLogin()">Entrar</a></div>
      </div>
    `);
  }

  function doLogin(redirectToCheckout = false) {
    const email = document.getElementById('login-email')?.value.trim();
    const pass = document.getElementById('login-pass')?.value;
    const errEl = document.getElementById('login-err');
    const btn = document.getElementById('login-btn');
    if (!email || !pass) { showErr(errEl, 'Preencha e-mail e senha.'); return; }
    btn.innerHTML = '<div class="loading-spinner"></div>';
    btn.disabled = true;
    setTimeout(() => {
      const users = store.get('users', []);
      const found = users.find(u => u.email === email && u.pass === btoa(pass));
      if (!found && !(email === 'admin@openanalytics.com.br' && pass === 'Admin@2026')) {
        btn.innerHTML = 'Entrar'; btn.disabled = false;
        showErr(errEl, 'E-mail ou senha incorretos.'); return;
      }
      const user = found || { id: 'admin', name: 'Administrador', email, isAdmin: true };
      state.user = user;
      store.set('user', user);
      closeModal();
      renderNav();
      toast(`Bem-vindo, ${user.name.split(' ')[0]}! 👋`, 'success');
      // Se tinha carrinho, abre checkout automaticamente
      if (redirectToCheckout && state.cart.length > 0) {
        setTimeout(() => openCheckoutInModal(), 300);
      }
    }, 900);
  }

  function doRegister() {
    const name = `${document.getElementById('reg-name')?.value} ${document.getElementById('reg-last')?.value}`.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const pass = document.getElementById('reg-pass')?.value;
    const pass2 = document.getElementById('reg-pass2')?.value;
    const errEl = document.getElementById('reg-err');
    const btn = document.getElementById('reg-btn');
    if (!name || name.length < 3) { showErr(errEl, 'Informe seu nome completo.'); return; }
    if (!email || !email.includes('@')) { showErr(errEl, 'E-mail inválido.'); return; }
    if (!pass || pass.length < 6) { showErr(errEl, 'A senha deve ter no mínimo 6 caracteres.'); return; }
    if (pass !== pass2) { showErr(errEl, 'As senhas não coincidem.'); return; }
    btn.innerHTML = '<div class="loading-spinner"></div>';
    btn.disabled = true;
    setTimeout(() => {
      const users = store.get('users', []);
      if (users.find(u => u.email === email)) {
        btn.innerHTML = '🚀 Criar minha conta'; btn.disabled = false;
        showErr(errEl, 'Este e-mail já está cadastrado.'); return;
      }
      const user = { id: 'u' + Date.now(), name, email, pass: btoa(pass), isAdmin: false, createdAt: new Date().toISOString() };
      users.push(user);
      store.set('users', users);
      state.user = user;
      store.set('user', user);
      closeModal();
      renderNav();
      toast(`Conta criada! Bem-vindo(a), ${name.split(' ')[0]}! 🎉`, 'success');
    }, 1000);
  }

  function logout() {
    state.user = null;
    store.del('user');
    renderNav();
    go('home');
    toast('Até logo!', 'info');
  }

  /* ═══════════════════════════════════════════════
     DASHBOARD (cliente)
  ═══════════════════════════════════════════════ */
  function pageDashboard() {
    if (!state.user) { setTimeout(() => { openLogin(); go('home'); }, 100); return '<div style="padding:120px;text-align:center;color:var(--gray2)">Redirecionando...</div>'; }
    const myOrders = state.orders.filter(o => o.user === state.user.email);
    const approved = myOrders.filter(o => o.status === 'approved');
    return `
    <div style="padding:100px 48px 60px;position:relative;z-index:2;">
      <div class="container">
        <div class="dash-header">
          <div>
            <div class="dash-title">Olá, ${state.user.name.split(' ')[0]}! 👋</div>
            <div class="dash-subtitle">Aqui estão suas compras e downloads</div>
          </div>
          <button class="btn-orange" onclick="OA.go('products')">+ Comprar mais produtos</button>
        </div>
        <div class="stat-cards">
          <div class="stat-card" style="--card-color:var(--blue)"><div class="stat-icon">🛒</div><div class="stat-value">${myOrders.length}</div><div class="stat-label">Pedidos realizados</div></div>
          <div class="stat-card" style="--card-color:var(--orange)"><div class="stat-icon">✅</div><div class="stat-value">${approved.length}</div><div class="stat-label">Compras aprovadas</div></div>
          <div class="stat-card" style="--card-color:#22c55e"><div class="stat-icon">📥</div><div class="stat-value">${approved.reduce((s,o)=>s+o.items.length,0)}</div><div class="stat-label">Arquivos disponíveis</div></div>
        </div>
        <div class="table-wrap">
          <div class="table-head"><div class="table-title">📋 Meus pedidos</div></div>
          ${myOrders.length ? `<table>
            <thead><tr><th>Pedido</th><th>Produto</th><th>Valor</th><th>Método</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>${myOrders.map(o=>`<tr>
              <td style="font-family:monospace;font-size:12px">${o.id}</td>
              <td>${o.items.map(i=>i.emoji+' '+i.name).join('<br>')}</td>
              <td style="font-weight:700;color:var(--orange)">R$ ${o.total.toFixed(2)}</td>
              <td>${o.method==='card'?'💳 Cartão':o.method==='pix'?'⚡ Pix':'🏦 Boleto'}</td>
              <td><span class="badge ${o.status==='approved'?'badge-green':o.status==='pending'?'badge-orange':'badge-red'}">${o.status==='approved'?'Aprovado':o.status==='pending'?'Pendente':'Cancelado'}</span></td>
              <td>${o.status==='approved'?`<button class="btn-download" style="font-size:12px;padding:6px 14px;" onclick="OA.go('downloads')">📥 Baixar</button>`:'<span style="color:var(--gray);font-size:12px">Aguardando</span>'}</td>
            </tr>`).join('')}</tbody>
          </table>` : `<div style="padding:48px;text-align:center;color:var(--gray2)">Você ainda não realizou nenhuma compra. <a onclick="OA.go('products')" style="color:var(--orange);cursor:pointer;">Ver produtos →</a></div>`}
        </div>
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     DOWNLOADS PAGE
  ═══════════════════════════════════════════════ */
  function pageDownloads() {
    if (!state.user) { setTimeout(() => openLogin(), 100); return ''; }
    const myOrders = state.orders.filter(o => o.user === state.user.email && o.status === 'approved');
    const purchasedIds = [...new Set(myOrders.flatMap(o => o.items.map(i => i.id)))];
    const purchasedProducts = state.products.filter(p => purchasedIds.includes(p.id));

    return `
    <div style="padding:100px 48px 60px;position:relative;z-index:2;">
      <div class="container">
        <div class="dash-header">
          <div>
            <div class="section-overline">Downloads</div>
            <div class="dash-title">📥 Seus arquivos</div>
          </div>
        </div>
        ${purchasedProducts.length ? purchasedProducts.map(p => `
          <div class="download-card">
            <div class="download-icon">${p.emoji}</div>
            <div class="download-info">
              <div class="download-name">${p.name}</div>
              <div class="download-desc">${p.desc||p.description||''}</div>
              <div class="download-meta">
                ${p.files.map(f => `<span>📄 ${f.name} (${f.size})</span>`).join(' · ')}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${p.files.map(f => `<button class="btn-download" onclick="OA.downloadFile('${p.id}','${f.name}')">⬇ ${f.name}</button>`).join('')}
            </div>
          </div>
        `).join('') : `
          <div style="text-align:center;padding:80px;color:var(--gray2);">
            <div style="font-size:64px;margin-bottom:16px;">📭</div>
            <div style="font-size:20px;font-weight:700;margin-bottom:8px;">Nenhum arquivo disponível</div>
            <p style="margin-bottom:24px;">Compre um produto para liberar o download.</p>
            <button class="btn-orange" onclick="OA.go('products')">Ver produtos</button>
          </div>
        `}
      </div>
    </div>`;
  }

  function downloadFile(productId, fileName) {
    toast(`Iniciando download de ${fileName}...`, 'info');
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = `downloads/${productId}/${fileName}`;
      link.download = fileName;
      link.click();
      toast(`${fileName} baixado com sucesso!`, 'success');
    }, 800);
  }

  /* ═══════════════════════════════════════════════
     ADMIN PAGE
  ═══════════════════════════════════════════════ */
  function pageAdmin() {
    if (!state.user?.isAdmin) { setTimeout(() => go('home'), 100); return '<div style="padding:120px;text-align:center;">Acesso negado.</div>'; }
    const orders = state.orders;
    const totalRevenue = orders.filter(o => o.status === 'approved').reduce((s, o) => s + o.total, 0);
    const users = store.get('users', []);

    return `
    <div style="padding:80px 48px 60px;position:relative;z-index:2;">
      <div class="container">
        <div class="dash-header">
          <div>
            <div class="section-overline">Painel Administrativo</div>
            <div class="dash-title">⚙ Open Analytics Admin</div>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn-primary" onclick="OA.openAddProduct()">+ Novo produto</button>
            <button class="btn-ghost" onclick="OA.openBankSettings()">🏦 Configurar banco</button>
          </div>
        </div>

        <!-- STATS -->
        <div class="stat-cards" style="margin-bottom:32px;">
          <div class="stat-card" style="--card-color:var(--orange)"><div class="stat-icon">💰</div><div class="stat-value">R$ ${totalRevenue.toFixed(2)}</div><div class="stat-label">Receita total</div></div>
          <div class="stat-card" style="--card-color:var(--blue)"><div class="stat-icon">📦</div><div class="stat-value">${orders.length}</div><div class="stat-label">Pedidos totais</div></div>
          <div class="stat-card" style="--card-color:#22c55e"><div class="stat-icon">👥</div><div class="stat-value">${users.length}</div><div class="stat-label">Clientes cadastrados</div></div>
          <div class="stat-card" style="--card-color:#a855f7"><div class="stat-icon">🛍</div><div class="stat-value">${state.products.filter(p=>p.active).length}</div><div class="stat-label">Produtos ativos</div></div>
        </div>

        <!-- CHART placeholder -->
        <div class="chart-wrap" style="margin-bottom:32px;">
          <div class="chart-header"><div class="chart-title">📈 Vendas por mês</div><span style="font-size:13px;color:var(--gray2)">Últimos 6 meses</span></div>
          <canvas id="salesChart" height="80"></canvas>
        </div>

        <!-- PRODUCTS TABLE -->
        <div class="table-wrap" style="margin-bottom:24px;">
          <div class="table-head">
            <div class="table-title">🛍 Produtos</div>
            <button class="btn-primary" style="font-size:13px;padding:8px 16px;" onclick="OA.openAddProduct()">+ Adicionar</button>
          </div>
          <table>
            <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              ${state.products.map(p => `<tr>
                <td><span style="font-size:20px;margin-right:8px">${p.emoji||'📦'}</span>${p.name}</td>
                <td><span class="badge badge-blue">${p.category}</span></td>
                <td style="font-weight:700;color:var(--orange)">R$ ${(parseFloat(p.price)||0).toFixed(2)}</td>
                <td><span class="badge ${p.active ? 'badge-green' : 'badge-gray'}">${p.active ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <button onclick="OA.toggleProduct('${p.id}')" style="background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--white);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;margin-right:6px;">${p.active ? 'Desativar' : 'Ativar'}</button>
                  <button onclick="OA.deleteProduct('${p.id}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;">Excluir</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <!-- ORDERS TABLE -->
        <div class="table-wrap">
          <div class="table-head"><div class="table-title">📋 Pedidos recentes</div></div>
          ${orders.length ? `<table>
            <thead><tr><th>ID</th><th>Cliente</th><th>Valor</th><th>Método</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>${orders.slice(-10).reverse().map(o=>`<tr>
              <td style="font-family:monospace;font-size:11px">${o.id}</td>
              <td>${o.user}</td>
              <td style="font-weight:700;color:var(--orange)">R$ ${o.total.toFixed(2)}</td>
              <td>${o.method==='card'?'💳':o.method==='pix'?'⚡':'🏦'} ${o.method}</td>
              <td><span class="badge ${o.status==='approved'?'badge-green':o.status==='pending'?'badge-orange':'badge-red'}">${o.status}</span></td>
              <td style="font-size:12px;color:var(--gray2)">${new Date(o.date).toLocaleDateString('pt-BR')}</td>
            </tr>`).join('')}</tbody>
          </table>` : `<div style="padding:40px;text-align:center;color:var(--gray2)">Nenhum pedido ainda.</div>`}
        </div>
      </div>
    </div>`;
  }

  function bindAdmin() {
    setTimeout(() => {
      const ctx = document.getElementById('salesChart');
      if (!ctx || !window.Chart) return;
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
          datasets: [{
            label: 'Receita (R$)',
            data: [1200, 1900, 1400, 2800, 3200, state.orders.filter(o=>o.status==='approved').reduce((s,o)=>s+o.total,0) || 4100],
            backgroundColor: 'rgba(21,101,192,0.6)',
            borderColor: 'rgba(21,101,192,1)',
            borderWidth: 2, borderRadius: 8,
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#6B7280' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#6B7280' }, grid: { display: false } } } }
      });
    }, 300);
  }

  function openAddProduct() {
    showModal(`
      <div class="modal-header">
        <div class="modal-title">➕ Novo Produto</div>
        <button class="modal-close" onclick="OA.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome do produto</label>
            <input class="form-input" id="np-name" placeholder="Ex: Site para Restaurante">
          </div>
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <select class="form-input" id="np-cat">
              <option value="site">🌐 Site</option>
              <option value="excel">📊 Excel</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea class="form-input" id="np-desc" rows="3" placeholder="Descreva o produto..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Preço (R$)</label>
            <input class="form-input" id="np-price" type="number" placeholder="297.00">
          </div>
          <div class="form-group">
            <label class="form-label">Preço antigo (R$)</label>
            <input class="form-input" id="np-oldprice" type="number" placeholder="497.00 (opcional)">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Emoji do produto</label>
          <input class="form-input" id="np-emoji" placeholder="🏠 (cole um emoji)">
        </div>
        <div class="form-group">
          <label class="form-label">Benefícios (um por linha)</label>
          <textarea class="form-input" id="np-feats" rows="4" placeholder="Landing Page responsiva&#10;Painel admin&#10;SEO otimizado"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Arquivos para download (nome | tamanho, um por linha)</label>
          <textarea class="form-input" id="np-files" rows="3" placeholder="produto-v1.zip | 5.2 MB&#10;manual.pdf | 1.1 MB"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Badge (opcional)</label>
          <input class="form-input" id="np-badge" placeholder="Novo / Mais vendido / Premium">
        </div>
        <button class="btn-orange btn-block" onclick="OA.saveNewProduct()">💾 Salvar produto</button>
      </div>
    `);
  }

  function saveNewProduct() {
    const name = document.getElementById('np-name')?.value.trim();
    const cat = document.getElementById('np-cat')?.value;
    const desc = document.getElementById('np-desc')?.value.trim();
    const price = parseFloat(document.getElementById('np-price')?.value);
    const oldPrice = parseFloat(document.getElementById('np-oldprice')?.value) || null;
    const emoji = document.getElementById('np-emoji')?.value.trim() || '📦';
    const feats = document.getElementById('np-feats')?.value.split('\n').map(f => f.trim()).filter(Boolean);
    const filesRaw = document.getElementById('np-files')?.value.split('\n').map(l => { const [n, s] = l.split('|'); return { name: (n||'').trim(), size: (s||'').trim() }; }).filter(f => f.name);
    const badge = document.getElementById('np-badge')?.value.trim() || null;

    if (!name || !desc || isNaN(price)) { toast('Preencha nome, descrição e preço.', 'error'); return; }

    const newP = { id: 'p' + Date.now(), name, category: cat, emoji, price, oldPrice, desc, features: feats, files: filesRaw.length ? filesRaw : [{ name: name.toLowerCase().replace(/ /g, '-') + '.zip', size: '5 MB' }], badge, active: true };
    state.products.push(newP);
    store.set('products', state.products);
    closeModal();
    renderPage('admin');
    bindAdmin();
    toast('Produto adicionado com sucesso!', 'success');
  }

  function toggleProduct(id) {
    const p = state.products.find(x => x.id === id);
    if (p) { p.active = !p.active; store.set('products', state.products); renderPage('admin'); bindAdmin(); toast(`Produto ${p.active ? 'ativado' : 'desativado'}.`, 'info'); }
  }

  function deleteProduct(id) {
    if (!confirm('Excluir este produto? Esta ação não pode ser desfeita.')) return;
    state.products = state.products.filter(p => p.id !== id);
    store.set('products', state.products);
    renderPage('admin');
    bindAdmin();
    toast('Produto excluído.', 'info');
  }

  function openBankSettings() {
    const bank = store.get('bank', {});
    showModal(`
      <div class="modal-header">
        <div class="modal-title">🏦 Dados bancários</div>
        <button class="modal-close" onclick="OA.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <p class="modal-sub" style="margin-bottom:20px;">Configure os dados de recebimento de pagamento. Estes dados serão exibidos no checkout via Pix e Boleto.</p>
        <div class="form-group"><label class="form-label">Chave Pix</label><input class="form-input" id="bk-pix" value="${bank.pix||''}" placeholder="CPF, CNPJ, e-mail ou telefone"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Banco</label><input class="form-input" id="bk-banco" value="${bank.banco||''}" placeholder="Ex: Nubank"></div>
          <div class="form-group"><label class="form-label">Agência</label><input class="form-input" id="bk-ag" value="${bank.agencia||''}" placeholder="0001"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Conta</label><input class="form-input" id="bk-cc" value="${bank.conta||''}" placeholder="12345-6"></div>
          <div class="form-group"><label class="form-label">Tipo</label><select class="form-input" id="bk-tipo"><option ${bank.tipo==='pj'?'selected':''} value="pj">Conta PJ</option><option ${bank.tipo==='pf'?'selected':''} value="pf">Conta PF</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Nome titular</label><input class="form-input" id="bk-nome" value="${bank.nome||''}" placeholder="Nome completo / Razão social"></div>
        <div class="form-group"><label class="form-label">CPF / CNPJ</label><input class="form-input" id="bk-doc" value="${bank.doc||''}" placeholder="000.000.000-00"></div>
        <button class="btn-primary btn-block" onclick="OA.saveBankSettings()">💾 Salvar dados</button>
      </div>
    `);
  }

  function saveBankSettings() {
    store.set('bank', {
      pix: document.getElementById('bk-pix')?.value,
      banco: document.getElementById('bk-banco')?.value,
      agencia: document.getElementById('bk-ag')?.value,
      conta: document.getElementById('bk-cc')?.value,
      tipo: document.getElementById('bk-tipo')?.value,
      nome: document.getElementById('bk-nome')?.value,
      doc: document.getElementById('bk-doc')?.value,
    });
    closeModal();
    toast('Dados bancários salvos!', 'success');
  }

  /* ═══════════════════════════════════════════════
     PAGE: ABOUT
  ═══════════════════════════════════════════════ */
  function pageAbout() {
    return `
    <div style="padding:120px 48px 80px;position:relative;z-index:2;max-width:800px;margin:0 auto;">
      <div class="section-overline">Sobre nós</div>
      <h1 class="section-title">Open Analytics</h1>
      <p style="font-size:18px;color:var(--gray2);line-height:1.8;margin-bottom:32px;">Somos especialistas em criar soluções digitais para pequenas e médias empresas. Sites profissionais e sistemas Excel que realmente funcionam.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px;">
        <div class="feature-card"><div class="feat-icon-wrap">🎯</div><div class="feat-title">Nossa missão</div><div class="feat-desc">Democratizar o acesso a ferramentas digitais de qualidade para qualquer negócio, com preços acessíveis e entrega imediata.</div></div>
        <div class="feature-card"><div class="feat-icon-wrap">💡</div><div class="feat-title">Nossa visão</div><div class="feat-desc">Ser a plataforma referência em venda de soluções digitais prontas no Brasil, com qualidade e suporte que fazem a diferença.</div></div>
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     MODAL ENGINE
  ═══════════════════════════════════════════════ */
  function showModal(html) {
    // Sempre reutiliza o overlay existente — nunca remove e recria
    let overlay = document.getElementById('modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" id="modal-box"></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
      });
    }
    const box = document.getElementById('modal-box');
    box.innerHTML = html;
    // Scroll sempre volta ao topo do modal
    box.scrollTop = 0;
    // Abre suavemente
    requestAnimationFrame(function() {
      overlay.classList.add('open');
    });
    // Impede scroll da página atrás
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // Remove após animação
    setTimeout(function() {
      if (overlay && !overlay.classList.contains('open')) {
        overlay.remove();
      }
    }, 350);
  }

  function switchModal(html) {
    // Troca o conteúdo do modal sem fechar — transição suave
    const box = document.getElementById('modal-box');
    if (!box) { showModal(html); return; }
    box.style.opacity = '0';
    box.style.transform = 'scale(0.97)';
    box.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    setTimeout(function() {
      box.innerHTML = html;
      box.scrollTop = 0;
      box.style.opacity = '1';
      box.style.transform = 'scale(1)';
    }, 150);
  }

  /* ─── TOAST ─────────────────────────────────── */
  function toast(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(50px)'; setTimeout(() => t.remove(), 300); }, 3500);
  }

  /* ─── HELPERS ───────────────────────────────── */
  function showErr(el, msg) { if (el) { el.textContent = msg; el.classList.remove('hidden'); } }
  function hideLoader() {
    const l = document.getElementById('page-loading');
    if (l) { setTimeout(() => l.classList.add('hidden'), 600); }
  }
  function animateOnScroll() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.product-card, .feature-card').forEach(el => {
      el.style.opacity = '0'; el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      observer.observe(el);
    });
  }

  /* ─── PUBLIC API ────────────────────────────── */
  return {
    init, go, openLogin, openRegister, doLogin, doRegister, logout,
    openProduct, addToCart, addToCartAndBuy, removeFromCart, openCart, openCheckoutInModal,
    openCheckout, switchPayTab, processPayment, fmtCC, fmtExp,
    openAddProduct, saveNewProduct, toggleProduct, deleteProduct,
    openBankSettings, saveBankSettings, downloadFile,
    showModal, closeModal, switchModal, buildLoginHTML, buildCheckoutHTML, toast,
  };
})();

document.addEventListener('DOMContentLoaded', OA.init);
