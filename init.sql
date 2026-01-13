-- 1. Użytkownicy i Auth
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255),
    email VARCHAR(320) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oidc_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    oidc_sub TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at BIGINT,
    UNIQUE(provider, oidc_sub)
);

-- 2. Magazyny
CREATE TABLE IF NOT EXISTS storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    localization TEXT NOT NULL,
    storage_area INT NOT NULL
);

-- 3. Przedmioty
CREATE TABLE IF NOT EXISTS item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    unit_of_measurement VARCHAR(10) NOT NULL,
    image_url TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_borrowed BOOLEAN DEFAULT false,
    is_damaged BOOLEAN DEFAULT false,
    last_borrowed_to UUID REFERENCES users(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    storage_id UUID REFERENCES storage(id),
    min_amount REAL DEFAULT 0
);

-- 4. Współdzielenie magazynów
CREATE TABLE IF NOT EXISTS user_storage (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_id UUID NOT NULL REFERENCES storage(id) ON DELETE CASCADE,
    role VARCHAR(20), -- np. 'admin', 'viewer'
    PRIMARY KEY (user_id, storage_id)
);

-- 5. Historia
CREATE TABLE IF NOT EXISTS item_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES item(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(20), 
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);