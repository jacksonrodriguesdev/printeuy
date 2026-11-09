-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `parent_id` INTEGER NULL,
    `image_path` VARCHAR(191) NULL,
    `linha` VARCHAR(191) NOT NULL DEFAULT 'AUTOMOTIVA',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_banners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `image_path` VARCHAR(191) NOT NULL,
    `image_path_mobile` VARCHAR(191) NULL,
    `titulo` VARCHAR(191) NULL,
    `kind` VARCHAR(191) NOT NULL,
    `link_url` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `linha` VARCHAR(191) NOT NULL DEFAULT 'AUTOMOTIVA',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_visits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `country_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `path` VARCHAR(191) NOT NULL,
    `referrer` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `visitor_id` VARCHAR(64) NULL,
    `session_id` VARCHAR(64) NULL,
    `ip_hash` VARCHAR(64) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `fonte` VARCHAR(40) NULL,
    `meio` VARCHAR(40) NULL,
    `utm_source` VARCHAR(100) NULL,
    `utm_medium` VARCHAR(100) NULL,
    `utm_campaign` VARCHAR(150) NULL,
    `referrer_host` VARCHAR(191) NULL,
    `device` VARCHAR(20) NULL,
    `browser` VARCHAR(40) NULL,
    `os` VARCHAR(40) NULL,
    `language` VARCHAR(20) NULL,
    `entrada` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NULL,

    INDEX `site_visits_created_at_idx`(`created_at`),
    INDEX `site_visits_visitor_id_idx`(`visitor_id`),
    INDEX `site_visits_user_id_idx`(`user_id`),
    INDEX `site_visits_session_id_idx`(`session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_eventos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipo` VARCHAR(20) NOT NULL,
    `dado` VARCHAR(400) NOT NULL,
    `pagina` VARCHAR(512) NULL,
    `visitor_id` VARCHAR(64) NULL,
    `session_id` VARCHAR(64) NULL,
    `ip_hash` VARCHAR(64) NULL,
    `user_id` INTEGER NULL,
    `city` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `country_code` VARCHAR(8) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `fonte` VARCHAR(40) NULL,
    `meio` VARCHAR(40) NULL,
    `utm_source` VARCHAR(100) NULL,
    `utm_medium` VARCHAR(100) NULL,
    `utm_campaign` VARCHAR(150) NULL,
    `referrer_host` VARCHAR(191) NULL,
    `device` VARCHAR(20) NULL,
    `browser` VARCHAR(40) NULL,
    `os` VARCHAR(40) NULL,
    `language` VARCHAR(20) NULL,

    INDEX `site_eventos_created_at_idx`(`created_at`),
    INDEX `site_eventos_tipo_created_at_idx`(`tipo`, `created_at`),
    INDEX `site_eventos_visitor_id_idx`(`visitor_id`),
    INDEX `site_eventos_session_id_idx`(`session_id`),
    INDEX `site_eventos_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analise_dia` (
    `dia` VARCHAR(10) NOT NULL,
    `versao` INTEGER NOT NULL,
    `dados` LONGTEXT NOT NULL,
    `gerado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`dia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analise_sessao` (
    `dia` VARCHAR(10) NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `visitante` VARCHAR(191) NOT NULL,
    `inicio` DATETIME(3) NOT NULL,
    `pais` VARCHAR(8) NULL,
    `dados` TEXT NOT NULL,

    INDEX `analise_sessao_dia_pais_idx`(`dia`, `pais`),
    INDEX `analise_sessao_visitante_idx`(`visitante`),
    PRIMARY KEY (`dia`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `mensagem` TEXT NULL,
    `file_path` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NOVA',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas` (
    `sku` VARCHAR(191) NOT NULL,
    `categoria` TEXT NULL,
    `category_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `descricao` TEXT NULL,
    `estoque` INTEGER NOT NULL DEFAULT 0,
    `imagem_principal` TEXT NULL,
    `marca` TEXT NULL,
    `nome` TEXT NOT NULL,
    `nome_es` TEXT NULL,
    `descricao_es` TEXT NULL,
    `peso` DOUBLE NULL,
    `tamanho` TEXT NULL,
    `altura` DOUBLE NULL,
    `largura` DOUBLE NULL,
    `valor_compra` DOUBLE NULL,
    `valor_promocional` DOUBLE NULL,
    `preco_brl` DOUBLE NULL,
    `veiculos_compativeis` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `url` TEXT NULL,
    `codigo_fabricante` TEXT NULL,
    `fabricante` TEXT NULL,
    `duplicado_de` VARCHAR(191) NULL,
    `marca_confirmada` BOOLEAN NOT NULL DEFAULT true,
    `imagem_origem` TEXT NULL,
    `imagem_buscada_em` DATETIME(3) NULL,
    `ean` TEXT NULL,
    `ncm` TEXT NULL,
    `profundidade` DOUBLE NULL,
    `margem` DOUBLE NULL,
    `preco_modo` VARCHAR(10) NOT NULL DEFAULT 'AUTO',
    `preco_uyu` DOUBLE NULL,
    `precificado_em` DATETIME(3) NULL,
    `popularidade` INTEGER NOT NULL DEFAULT 0,
    `qtd_minima` INTEGER NULL,

    PRIMARY KEY (`sku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas_img` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_path` VARCHAR(191) NOT NULL,
    `image_type` VARCHAR(191) NOT NULL DEFAULT 'thumb',
    `sku` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 99,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pecas_img_sku_image_path_key`(`sku`, `image_path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas_aplicacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `montadora` VARCHAR(191) NOT NULL,
    `veiculo` VARCHAR(191) NOT NULL,
    `ano` VARCHAR(191) NULL,
    `motor` VARCHAR(191) NULL,

    INDEX `pecas_aplicacao_montadora_veiculo_idx`(`montadora`, `veiculo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas_similar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `codigo_similar` VARCHAR(191) NOT NULL,
    `marca_similar` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas_ficha_tecnica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `chave` VARCHAR(191) NOT NULL,
    `valor` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepage_blocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `position` INTEGER NOT NULL DEFAULT 0,
    `title` VARCHAR(191) NULL,
    `config` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_completo` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha_hash` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `endereco` TEXT NULL,
    `cidade` VARCHAR(191) NULL,
    `ponto_referencia` TEXT NULL,
    `numero_casa` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `pais` VARCHAR(191) NULL DEFAULT 'Uruguai',
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `google_id` VARCHAR(64) NULL,
    `avatar_url` TEXT NULL,
    `departamento` VARCHAR(40) NULL,
    `ultimo_login` DATETIME(3) NULL,
    `recebe_emails` BOOLEAN NOT NULL DEFAULT true,
    `cupom` VARCHAR(20) NULL,
    `cupom_usado_em` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_google_id_key`(`google_id`),
    UNIQUE INDEX `users_cupom_key`(`cupom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalogos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(200) NOT NULL,
    `marca` VARCHAR(60) NULL,
    `tipo` VARCHAR(60) NOT NULL DEFAULT 'Catálogo de piezas',
    `descricao` TEXT NULL,
    `arquivo` VARCHAR(255) NOT NULL,
    `tamanho` BIGINT NOT NULL DEFAULT 0,
    `idioma` VARCHAR(20) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT false,
    `publicado_em` DATETIME(3) NULL,
    `exige_login` BOOLEAN NOT NULL DEFAULT true,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalogos_downloads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `catalogo_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `catalogos_downloads_catalogo_id_idx`(`catalogo_id`),
    INDEX `catalogos_downloads_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carrinhos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visitante_id` VARCHAR(64) NOT NULL,
    `user_id` INTEGER NULL,
    `itens` TEXT NOT NULL,
    `qtd_itens` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    `etapa` VARCHAR(20) NOT NULL DEFAULT 'NOVO',
    `nota` TEXT NULL,
    `valor_fechado` DOUBLE NULL,
    `contatos` INTEGER NOT NULL DEFAULT 0,
    `contatado_em` DATETIME(3) NULL,
    `enviado_em` DATETIME(3) NULL,
    `fbp` VARCHAR(255) NULL,
    `fbc` VARCHAR(255) NULL,
    `capi_compra_em` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `carrinhos_visitante_id_idx`(`visitante_id`),
    INDEX `carrinhos_user_id_idx`(`user_id`),
    INDEX `carrinhos_updated_at_idx`(`updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_campanhas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `assunto` VARCHAR(200) NOT NULL,
    `preheader` VARCHAR(200) NULL,
    `conteudo` LONGTEXT NOT NULL,
    `publico` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    `total` INTEGER NOT NULL DEFAULT 0,
    `enviados` INTEGER NOT NULL DEFAULT 0,
    `falhas` INTEGER NOT NULL DEFAULT 0,
    `erro` TEXT NULL,
    `enviado_em` DATETIME(3) NULL,
    `agendado_para` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_envios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanha_id` INTEGER NULL,
    `automacao_id` INTEGER NULL,
    `chave` VARCHAR(150) NULL,
    `user_id` INTEGER NULL,
    `email` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(20) NOT NULL DEFAULT 'CAMPANHA',
    `status` VARCHAR(20) NOT NULL DEFAULT 'ENVIADO',
    `resend_id` VARCHAR(64) NULL,
    `erro` TEXT NULL,
    `aberto_em` DATETIME(3) NULL,
    `clicado_em` DATETIME(3) NULL,
    `produtos` TEXT NULL,
    `cupom` VARCHAR(40) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_envios_campanha_id_idx`(`campanha_id`),
    INDEX `email_envios_automacao_id_user_id_idx`(`automacao_id`, `user_id`),
    INDEX `email_envios_user_id_idx`(`user_id`),
    INDEX `email_envios_resend_id_idx`(`resend_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `par` VARCHAR(10) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `fonte` VARCHAR(80) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cotacoes_par_created_at_idx`(`par`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracoes` (
    `chave` VARCHAR(60) NOT NULL,
    `valor` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`chave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_automacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(30) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT false,
    `ativado_em` DATETIME(3) NULL,
    `assunto` VARCHAR(200) NOT NULL,
    `preheader` VARCHAR(200) NULL,
    `conteudo` LONGTEXT NOT NULL,
    `publico` TEXT NOT NULL,
    `config` TEXT NOT NULL,
    `cursor` INTEGER NOT NULL DEFAULT 0,
    `enviados` INTEGER NOT NULL DEFAULT 0,
    `ultimo_erro` TEXT NULL,
    `rodou_em` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto_preco_snapshot` (
    `sku` VARCHAR(191) NOT NULL,
    `preco_brl` DOUBLE NOT NULL,
    `promocao` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`sku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto_eventos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `de_brl` DOUBLE NOT NULL,
    `para_brl` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `produto_eventos_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_codigos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `codigo_hash` VARCHAR(64) NOT NULL,
    `tentativas` INTEGER NOT NULL DEFAULT 0,
    `usado` BOOLEAN NOT NULL DEFAULT false,
    `expira_em` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_codigos_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketing_eventos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plataforma` VARCHAR(20) NOT NULL,
    `evento` VARCHAR(40) NOT NULL,
    `event_id` VARCHAR(100) NULL,
    `ok` BOOLEAN NOT NULL DEFAULT false,
    `teste` BOOLEAN NOT NULL DEFAULT false,
    `detalhe` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `marketing_eventos_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `precos_ofertas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `fonte` VARCHAR(20) NOT NULL,
    `pais` VARCHAR(5) NOT NULL,
    `loja` VARCHAR(150) NULL,
    `titulo` VARCHAR(400) NOT NULL,
    `preco` DOUBLE NOT NULL,
    `moeda` VARCHAR(5) NOT NULL,
    `preco_brl` DOUBLE NULL,
    `relevante` BOOLEAN NOT NULL DEFAULT true,
    `ignorar` BOOLEAN NOT NULL DEFAULT false,
    `link` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `precos_ofertas_sku_idx`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `precos_resumo` (
    `sku` VARCHAR(191) NOT NULL,
    `achados` INTEGER NOT NULL DEFAULT 0,
    `menor_brl` DOUBLE NULL,
    `mediana_brl` DOUBLE NULL,
    `maior_brl` DOUBLE NULL,
    `erro` TEXT NULL,
    `pesquisado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `aplicado_em` DATETIME(3) NULL,

    PRIMARY KEY (`sku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `links_pagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(32) NOT NULL,
    `pais` VARCHAR(2) NOT NULL,
    `moeda` VARCHAR(3) NOT NULL,
    `itens` TEXT NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `frete` INTEGER NOT NULL DEFAULT 0,
    `frete_modo` VARCHAR(20) NOT NULL DEFAULT 'COBRADO',
    `cupom` VARCHAR(40) NULL,
    `desconto` INTEGER NOT NULL DEFAULT 0,
    `total` INTEGER NOT NULL,
    `metodos` VARCHAR(60) NOT NULL,
    `descricao` VARCHAR(200) NULL,
    `nota_cliente` TEXT NULL,
    `nota_interna` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    `email_cliente` VARCHAR(191) NULL,
    `user_id` INTEGER NULL,
    `carrinho_id` INTEGER NULL,
    `expira_em` DATETIME(3) NULL,
    `pago_em` DATETIME(3) NULL,
    `criado_por` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `links_pagamento_codigo_key`(`codigo`),
    INDEX `links_pagamento_status_created_at_idx`(`status`, `created_at`),
    INDEX `links_pagamento_user_id_idx`(`user_id`),
    INDEX `links_pagamento_carrinho_id_idx`(`carrinho_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `link_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `metodo` VARCHAR(20) NOT NULL,
    `provedor` VARCHAR(10) NOT NULL DEFAULT 'dlocal',
    `order_id` VARCHAR(64) NOT NULL,
    `dlocal_id` VARCHAR(100) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'CRIANDO',
    `status_code` VARCHAR(8) NULL,
    `status_detalhe` VARCHAR(300) NULL,
    `valor` INTEGER NOT NULL,
    `moeda` VARCHAR(3) NOT NULL,
    `documento` VARCHAR(24) NULL,
    `ticket` TEXT NULL,
    `redirect_url` TEXT NULL,
    `bandeira` VARCHAR(30) NULL,
    `final_cartao` VARCHAR(4) NULL,
    `payload` LONGTEXT NULL,
    `duplicado` BOOLEAN NOT NULL DEFAULT false,
    `pago_em` DATETIME(3) NULL,
    `expira_em` DATETIME(3) NULL,
    `conferido_em` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pagamentos_order_id_key`(`order_id`),
    UNIQUE INDEX `pagamentos_dlocal_id_key`(`dlocal_id`),
    INDEX `pagamentos_link_id_idx`(`link_id`),
    INDEX `pagamentos_status_updated_at_idx`(`status`, `updated_at`),
    INDEX `pagamentos_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamento_eventos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `link_id` INTEGER NOT NULL,
    `pagamento_id` INTEGER NULL,
    `tipo` VARCHAR(30) NOT NULL,
    `detalhe` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pagamento_eventos_link_id_idx`(`link_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dlocal_avisos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(20) NOT NULL,
    `dlocal_id` VARCHAR(100) NULL,
    `status` VARCHAR(20) NULL,
    `assinatura_ok` BOOLEAN NOT NULL DEFAULT false,
    `processado` BOOLEAN NOT NULL DEFAULT false,
    `erro` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `dlocal_avisos_created_at_idx`(`created_at`),
    INDEX `dlocal_avisos_dlocal_id_idx`(`dlocal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gsc_dia` (
    `dia` VARCHAR(10) NOT NULL,
    `pais` VARCHAR(3) NOT NULL,
    `cliques` INTEGER NOT NULL DEFAULT 0,
    `impressoes` INTEGER NOT NULL DEFAULT 0,
    `pos_soma` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`dia`, `pais`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gsc_consulta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dia` VARCHAR(10) NOT NULL,
    `pais` VARCHAR(3) NOT NULL,
    `consulta` VARCHAR(400) NOT NULL,
    `cliques` INTEGER NOT NULL DEFAULT 0,
    `impressoes` INTEGER NOT NULL DEFAULT 0,
    `pos_soma` DOUBLE NOT NULL DEFAULT 0,

    INDEX `gsc_consulta_dia_idx`(`dia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gsc_pagina` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dia` VARCHAR(10) NOT NULL,
    `pais` VARCHAR(3) NOT NULL,
    `pagina` VARCHAR(600) NOT NULL,
    `cliques` INTEGER NOT NULL DEFAULT 0,
    `impressoes` INTEGER NOT NULL DEFAULT 0,
    `pos_soma` DOUBLE NOT NULL DEFAULT 0,

    INDEX `gsc_pagina_dia_idx`(`dia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ads_campanha` (
    `plataforma` VARCHAR(10) NOT NULL,
    `id_externo` VARCHAR(40) NOT NULL,
    `nome` VARCHAR(300) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `status_origem` VARCHAR(40) NULL,
    `orcamento_diario` DOUBLE NULL,
    `orcamento_ref` VARCHAR(200) NULL,
    `orcamento_compartilhado` BOOLEAN NOT NULL DEFAULT false,
    `objetivo` VARCHAR(60) NULL,
    `moeda` VARCHAR(3) NOT NULL,
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`plataforma`, `id_externo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ads_dia` (
    `plataforma` VARCHAR(10) NOT NULL,
    `id_externo` VARCHAR(40) NOT NULL,
    `dia` VARCHAR(10) NOT NULL,
    `gasto` DOUBLE NOT NULL DEFAULT 0,
    `impressoes` INTEGER NOT NULL DEFAULT 0,
    `cliques` INTEGER NOT NULL DEFAULT 0,
    `conversoes` DOUBLE NOT NULL DEFAULT 0,
    `valor_conv` DOUBLE NOT NULL DEFAULT 0,
    `leads` DOUBLE NOT NULL DEFAULT 0,

    INDEX `ads_dia_dia_idx`(`dia`),
    PRIMARY KEY (`plataforma`, `id_externo`, `dia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ads_acao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plataforma` VARCHAR(10) NOT NULL,
    `id_externo` VARCHAR(40) NOT NULL,
    `nome` VARCHAR(300) NOT NULL,
    `acao` VARCHAR(20) NOT NULL,
    `de` VARCHAR(60) NULL,
    `para` VARCHAR(60) NULL,
    `admin_id` INTEGER NULL,
    `ok` BOOLEAN NOT NULL DEFAULT false,
    `erro` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ads_acao_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campanhas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `tipo` VARCHAR(20) NOT NULL DEFAULT 'BLACK_FRIDAY',
    `ativa` BOOLEAN NOT NULL DEFAULT false,
    `pre_inicio` DATETIME(3) NOT NULL,
    `inicio` DATETIME(3) NOT NULL,
    `fim` DATETIME(3) NOT NULL,
    `tema` VARCHAR(20) NOT NULL DEFAULT 'black',
    `config` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campanha_regras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campanha_id` INTEGER NOT NULL,
    `tipo` VARCHAR(12) NOT NULL,
    `alvo` VARCHAR(191) NOT NULL DEFAULT '',
    `pct` DOUBLE NOT NULL,
    `fase` VARCHAR(10) NOT NULL DEFAULT 'BLACK',
    `destaque` BOOLEAN NOT NULL DEFAULT false,

    INDEX `campanha_regras_campanha_id_idx`(`campanha_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cupons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(40) NOT NULL,
    `campanha_id` INTEGER NULL,
    `tipo` VARCHAR(12) NOT NULL,
    `valor` DOUBLE NOT NULL DEFAULT 0,
    `moeda` VARCHAR(3) NOT NULL DEFAULT 'UYU',
    `minimo` DOUBLE NOT NULL DEFAULT 0,
    `descricao` VARCHAR(300) NULL,
    `descricao_pt` VARCHAR(300) NULL,
    `inicio` DATETIME(3) NULL,
    `fim` DATETIME(3) NULL,
    `revelar_em` DATETIME(3) NULL,
    `max_usos` INTEGER NOT NULL DEFAULT 0,
    `usos` INTEGER NOT NULL DEFAULT 0,
    `por_cliente` INTEGER NOT NULL DEFAULT 1,
    `so_primeira_compra` BOOLEAN NOT NULL DEFAULT false,
    `publico` BOOLEAN NOT NULL DEFAULT true,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cupons_codigo_key`(`codigo`),
    INDEX `cupons_campanha_id_idx`(`campanha_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_cliques` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `envio_id` INTEGER NOT NULL,
    `campanha_id` INTEGER NULL,
    `automacao_id` INTEGER NULL,
    `anuncio_id` INTEGER NULL,
    `url` VARCHAR(1000) NOT NULL,
    `dispositivo` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_cliques_created_at_idx`(`created_at`),
    INDEX `email_cliques_campanha_id_idx`(`campanha_id`),
    INDEX `email_cliques_automacao_id_idx`(`automacao_id`),
    INDEX `email_cliques_anuncio_id_idx`(`anuncio_id`),
    INDEX `email_cliques_envio_id_idx`(`envio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_anuncios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `texto` TEXT NULL,
    `imagem` VARCHAR(500) NULL,
    `link` VARCHAR(500) NOT NULL,
    `botao` VARCHAR(80) NULL,
    `onde` VARCHAR(20) NOT NULL DEFAULT 'TODOS',
    `peso` INTEGER NOT NULL DEFAULT 1,
    `ativo` BOOLEAN NOT NULL DEFAULT false,
    `inicio` DATETIME(3) NULL,
    `fim` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_anuncio_exibicoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anuncio_id` INTEGER NOT NULL,
    `resend_id` VARCHAR(64) NULL,
    `user_id` INTEGER NULL,
    `origem` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_anuncio_exibicoes_anuncio_id_created_at_idx`(`anuncio_id`, `created_at`),
    INDEX `email_anuncio_exibicoes_resend_id_idx`(`resend_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instagram_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(20) NOT NULL,
    `legenda` TEXT NULL,
    `comentario` TEXT NULL,
    `midias` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    `agendado_para` DATETIME(3) NULL,
    `publicado_em` DATETIME(3) NULL,
    `ig_media_id` VARCHAR(64) NULL,
    `permalink` VARCHAR(300) NULL,
    `erro` TEXT NULL,
    `metricas` TEXT NULL,
    `metricas_em` DATETIME(3) NULL,
    `facebook` BOOLEAN NOT NULL DEFAULT false,
    `fb_post_id` VARCHAR(80) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `instagram_posts_status_agendado_para_idx`(`status`, `agendado_para`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `origem` VARCHAR(20) NOT NULL,
    `ref` VARCHAR(120) NOT NULL,
    `nome` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `telefone` VARCHAR(60) NULL,
    `cidade` VARCHAR(191) NULL,
    `detalhe` TEXT NULL,
    `campanha` VARCHAR(300) NULL,
    `anuncio` VARCHAR(300) NULL,
    `user_id` INTEGER NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'NOVO',
    `nota` TEXT NULL,
    `valor` DOUBLE NULL,
    `quando` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leads_status_quando_idx`(`status`, `quando`),
    INDEX `leads_quando_idx`(`quando`),
    UNIQUE INDEX `leads_origem_ref_key`(`origem`, `ref`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(24) NOT NULL,
    `cliente_nome` VARCHAR(160) NOT NULL,
    `cliente_email` VARCHAR(191) NULL,
    `cliente_telefone` VARCHAR(40) NULL,
    `cliente_doc` VARCHAR(40) NULL,
    `endereco` TEXT NULL,
    `cidade` VARCHAR(120) NULL,
    `departamento` VARCHAR(80) NULL,
    `cep` VARCHAR(20) NULL,
    `pais` VARCHAR(2) NOT NULL DEFAULT 'UY',
    `user_id` INTEGER NULL,
    `itens` TEXT NOT NULL,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `moeda` VARCHAR(3) NOT NULL DEFAULT 'UYU',
    `transportadora` VARCHAR(80) NULL,
    `rastreio` VARCHAR(80) NULL,
    `observacao` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    `cupom` VARCHAR(40) NULL,
    `avaliada_em` DATETIME(3) NULL,
    `origem` VARCHAR(10) NOT NULL DEFAULT 'MANUAL',
    `link_id` INTEGER NULL,
    `canal` VARCHAR(20) NULL,
    `metodo` VARCHAR(20) NULL,
    `frete_cobrado` DOUBLE NOT NULL DEFAULT 0,
    `desconto` DOUBLE NOT NULL DEFAULT 0,
    `taxa_pagamento` DOUBLE NULL,
    `frete_custo` DOUBLE NULL,
    `cotacao_brl` DOUBLE NULL,
    `end_numero` VARCHAR(20) NULL,
    `end_bairro` VARCHAR(80) NULL,
    `etapa` VARCHAR(20) NOT NULL DEFAULT 'AGUARDANDO',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vendas_codigo_key`(`codigo`),
    UNIQUE INDEX `vendas_link_id_key`(`link_id`),
    INDEX `vendas_created_at_idx`(`created_at`),
    INDEX `vendas_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indicacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `codigo` VARCHAR(40) NOT NULL,
    `cliques` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `indicacoes_user_id_key`(`user_id`),
    UNIQUE INDEX `indicacoes_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indicacao_premios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `indicacao_id` INTEGER NOT NULL,
    `link_id` INTEGER NOT NULL,
    `indicado_email` VARCHAR(191) NULL,
    `cupom` VARCHAR(40) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `indicacao_premios_link_id_key`(`link_id`),
    INDEX `indicacao_premios_indicacao_id_idx`(`indicacao_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `venda_etapas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `venda_id` INTEGER NOT NULL,
    `etapa` VARCHAR(20) NOT NULL,
    `nota` TEXT NULL,
    `email` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `venda_etapas_venda_id_idx`(`venda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `texto` TEXT NULL,
    `link` VARCHAR(300) NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notificacoes_user_id_lida_idx`(`user_id`, `lida`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `despesas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(160) NOT NULL,
    `categoria` VARCHAR(20) NOT NULL DEFAULT 'FIXA',
    `valor` DOUBLE NOT NULL,
    `moeda` VARCHAR(3) NOT NULL,
    `mes` VARCHAR(7) NOT NULL,
    `recorrente` BOOLEAN NOT NULL DEFAULT true,
    `mes_fim` VARCHAR(7) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `despesas_mes_idx`(`mes`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(64) NOT NULL,
    `venda_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `nome` VARCHAR(120) NOT NULL,
    `cidade` VARCHAR(120) NULL,
    `nota` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `idioma` VARCHAR(2) NOT NULL DEFAULT 'es',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    `resposta` TEXT NULL,
    `com_cupom` BOOLEAN NOT NULL DEFAULT false,
    `verificada` BOOLEAN NOT NULL DEFAULT false,
    `fotos` TEXT NULL,
    `aprovada_em` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `avaliacoes_sku_status_idx`(`sku`, `status`),
    INDEX `avaliacoes_status_created_at_idx`(`status`, `created_at`),
    INDEX `avaliacoes_venda_id_idx`(`venda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contatos_whatsapp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telefone` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(120) NULL,
    `cupom` VARCHAR(20) NULL,
    `cupom_usado_em` DATETIME(3) NULL,
    `idioma` VARCHAR(2) NOT NULL DEFAULT 'es',
    `motivo` VARCHAR(20) NULL,
    `pagina` VARCHAR(300) NULL,
    `interesse` TEXT NULL,
    `visitor_id` VARCHAR(64) NULL,
    `fonte` VARCHAR(40) NULL,
    `utm_campaign` VARCHAR(150) NULL,
    `cidade` VARCHAR(191) NULL,
    `vezes` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(20) NOT NULL DEFAULT 'NOVO',
    `nota` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `contatos_whatsapp_telefone_key`(`telefone`),
    UNIQUE INDEX `contatos_whatsapp_cupom_key`(`cupom`),
    INDEX `contatos_whatsapp_visitor_id_idx`(`visitor_id`),
    INDEX `contatos_whatsapp_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avisos_preco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(191) NULL,
    `user_id` INTEGER NULL,
    `idioma` VARCHAR(2) NOT NULL DEFAULT 'es',
    `preco_ref_brl` DOUBLE NOT NULL,
    `preco_aviso_brl` DOUBLE NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    `visitor_id` VARCHAR(64) NULL,
    `baixou_em` DATETIME(3) NULL,
    `avisado_em` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `avisos_preco_status_idx`(`status`),
    INDEX `avisos_preco_sku_idx`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passkeys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `credential_id` VARCHAR(255) NOT NULL,
    `public_key` TEXT NOT NULL,
    `counter` BIGINT NOT NULL DEFAULT 0,
    `transports` VARCHAR(200) NULL,
    `aparelho` VARCHAR(120) NULL,
    `sincronizada` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usado_em` DATETIME(3) NULL,

    UNIQUE INDEX `passkeys_credential_id_key`(`credential_id`),
    INDEX `passkeys_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notas_fiscais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `venda_id` INTEGER NOT NULL,
    `ref` VARCHAR(60) NOT NULL,
    `ambiente` VARCHAR(12) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PROCESSANDO',
    `numero` VARCHAR(20) NULL,
    `serie` VARCHAR(5) NULL,
    `chave` VARCHAR(44) NULL,
    `valor` DOUBLE NOT NULL DEFAULT 0,
    `destinatario` VARCHAR(160) NULL,
    `danfe` VARCHAR(400) NULL,
    `xml` VARCHAR(400) NULL,
    `mensagem` TEXT NULL,
    `automatica` BOOLEAN NOT NULL DEFAULT false,
    `email_enviado` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `notas_fiscais_ref_key`(`ref`),
    INDEX `notas_fiscais_venda_id_idx`(`venda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `extrato_arquivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `banco` VARCHAR(40) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `titular` VARCHAR(160) NULL,
    `inicio` VARCHAR(10) NOT NULL,
    `fim` VARCHAR(10) NOT NULL,
    `movimentos` INTEGER NOT NULL DEFAULT 0,
    `entradas` DOUBLE NOT NULL DEFAULT 0,
    `saidas` DOUBLE NOT NULL DEFAULT 0,
    `conferido` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `extrato_arquivos_banco_inicio_fim_key`(`banco`, `inicio`, `fim`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `extrato_movimentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `arquivo_id` INTEGER NOT NULL,
    `banco` VARCHAR(40) NOT NULL,
    `data` VARCHAR(10) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `tipo` VARCHAR(80) NOT NULL,
    `contraparte` VARCHAR(160) NOT NULL,
    `documento` VARCHAR(30) NULL,
    `descricao` TEXT NOT NULL,
    `categoria` VARCHAR(20) NOT NULL DEFAULT 'A_CLASSIFICAR',
    `manual` BOOLEAN NOT NULL DEFAULT false,
    `venda_id` INTEGER NULL,
    `nota` VARCHAR(300) NULL,
    `subcategoria` VARCHAR(20) NULL,
    `hash` VARCHAR(64) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `extrato_movimentos_hash_key`(`hash`),
    INDEX `extrato_movimentos_data_idx`(`data`),
    INDEX `extrato_movimentos_categoria_idx`(`categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `extrato_regras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chave` VARCHAR(160) NOT NULL,
    `sentido` VARCHAR(1) NOT NULL,
    `categoria` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `extrato_regras_chave_sentido_key`(`chave`, `sentido`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas_detalhes` (
    `sku` VARCHAR(191) NOT NULL,
    `dados` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`sku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pecas` ADD CONSTRAINT `pecas_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pecas` ADD CONSTRAINT `pecas_duplicado_de_fkey` FOREIGN KEY (`duplicado_de`) REFERENCES `pecas`(`sku`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pecas_img` ADD CONSTRAINT `pecas_img_sku_fkey` FOREIGN KEY (`sku`) REFERENCES `pecas`(`sku`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pecas_aplicacao` ADD CONSTRAINT `pecas_aplicacao_sku_fkey` FOREIGN KEY (`sku`) REFERENCES `pecas`(`sku`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pecas_similar` ADD CONSTRAINT `pecas_similar_sku_fkey` FOREIGN KEY (`sku`) REFERENCES `pecas`(`sku`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pecas_ficha_tecnica` ADD CONSTRAINT `pecas_ficha_tecnica_sku_fkey` FOREIGN KEY (`sku`) REFERENCES `pecas`(`sku`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catalogos_downloads` ADD CONSTRAINT `catalogos_downloads_catalogo_id_fkey` FOREIGN KEY (`catalogo_id`) REFERENCES `catalogos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catalogos_downloads` ADD CONSTRAINT `catalogos_downloads_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carrinhos` ADD CONSTRAINT `carrinhos_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_envios` ADD CONSTRAINT `email_envios_campanha_id_fkey` FOREIGN KEY (`campanha_id`) REFERENCES `email_campanhas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_envios` ADD CONSTRAINT `email_envios_automacao_id_fkey` FOREIGN KEY (`automacao_id`) REFERENCES `email_automacoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `links_pagamento` ADD CONSTRAINT `links_pagamento_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_link_id_fkey` FOREIGN KEY (`link_id`) REFERENCES `links_pagamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campanha_regras` ADD CONSTRAINT `campanha_regras_campanha_id_fkey` FOREIGN KEY (`campanha_id`) REFERENCES `campanhas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cupons` ADD CONSTRAINT `cupons_campanha_id_fkey` FOREIGN KEY (`campanha_id`) REFERENCES `campanhas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

