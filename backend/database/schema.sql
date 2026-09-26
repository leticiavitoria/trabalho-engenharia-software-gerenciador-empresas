-- =====================================================================
-- Gerenciador de Empresas — esquema do banco de dados (PostgreSQL 16)
--
-- O script é idempotente: pode ser executado várias vezes sem apagar
-- dados (use `make db-reset` para recriar tudo do zero).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Perfis de acesso (dados de referência)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id          VARCHAR(20)  PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description TEXT         NOT NULL,
    position    SMALLINT     NOT NULL
);

-- ---------------------------------------------------------------------
-- Funcionalidades que podem ser liberadas para cada perfil
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
    id       VARCHAR(50)  PRIMARY KEY,
    label    VARCHAR(100) NOT NULL,
    position SMALLINT     NOT NULL
);

-- ---------------------------------------------------------------------
-- Matriz perfil × funcionalidade
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       VARCHAR(20) NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    permission_id VARCHAR(50) NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
    enabled       BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- ---------------------------------------------------------------------
-- Empresas
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id         BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    cnpj       VARCHAR(18)  NOT NULL,
    sector     VARCHAR(100) NOT NULL,
    city       VARCHAR(120) NOT NULL,
    status     VARCHAR(10)  NOT NULL DEFAULT 'active',
    email      VARCHAR(254) NOT NULL,
    phone      VARCHAR(30),
    created_at DATE         NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT companies_cnpj_key UNIQUE (cnpj),
    CONSTRAINT companies_status_check CHECK (status IN ('active', 'pending', 'inactive'))
);

-- ---------------------------------------------------------------------
-- Usuários (cada usuário pertence a exatamente uma empresa)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id             BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    email          VARCHAR(254) NOT NULL,
    -- Excluir a empresa remove os usuários vinculados a ela.
    company_id     BIGINT       NOT NULL,
    role_id        VARCHAR(20)  NOT NULL,
    status         VARCHAR(10)  NOT NULL DEFAULT 'active',
    last_access_at TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT users_status_check CHECK (status IN ('active', 'pending', 'inactive'))
);

-- E-mail único sem diferenciar maiúsculas de minúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email));
CREATE INDEX IF NOT EXISTS users_company_id_idx ON users (company_id);

-- ---------------------------------------------------------------------
-- Dados de referência (necessários para o sistema funcionar)
-- ---------------------------------------------------------------------
INSERT INTO roles (id, name, description, position) VALUES
    ('admin',  'Administrador', 'Acessa todas as funcionalidades, inclusive permissões.',                1),
    ('editor', 'Editor',        'Cadastra e edita empresas, sem excluir nem gerenciar usuários.',        2),
    ('viewer', 'Visualizador',  'Apenas consulta empresas e usuários.',                                   3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO permissions (id, label, position) VALUES
    ('companies.view',     'Visualizar empresas', 1),
    ('companies.create',   'Cadastrar empresas',  2),
    ('companies.edit',     'Editar empresas',     3),
    ('companies.delete',   'Excluir empresas',    4),
    ('users.view',         'Visualizar usuários', 5),
    ('users.manage',       'Gerenciar usuários',  6),
    ('permissions.manage', 'Alterar permissões',  7)
ON CONFLICT (id) DO NOTHING;

-- Matriz padrão. ON CONFLICT DO NOTHING preserva alterações já feitas.
INSERT INTO role_permissions (role_id, permission_id, enabled) VALUES
    ('admin',  'companies.view',     TRUE),
    ('admin',  'companies.create',   TRUE),
    ('admin',  'companies.edit',     TRUE),
    ('admin',  'companies.delete',   TRUE),
    ('admin',  'users.view',         TRUE),
    ('admin',  'users.manage',       TRUE),
    ('admin',  'permissions.manage', TRUE),
    ('editor', 'companies.view',     TRUE),
    ('editor', 'companies.create',   TRUE),
    ('editor', 'companies.edit',     TRUE),
    ('editor', 'companies.delete',   FALSE),
    ('editor', 'users.view',         TRUE),
    ('editor', 'users.manage',       FALSE),
    ('editor', 'permissions.manage', FALSE),
    ('viewer', 'companies.view',     TRUE),
    ('viewer', 'companies.create',   FALSE),
    ('viewer', 'companies.edit',     FALSE),
    ('viewer', 'companies.delete',   FALSE),
    ('viewer', 'users.view',         TRUE),
    ('viewer', 'users.manage',       FALSE),
    ('viewer', 'permissions.manage', FALSE)
ON CONFLICT (role_id, permission_id) DO NOTHING;
