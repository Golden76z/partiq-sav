.PHONY: help \
	setup \
	dev \
	db-up db-wait db-down db-migrate db-reset db-seed db-studio db-bootstrap \
	lint build \
	docker-up docker-down docker-logs docker-migrate docker-seed \
	clean

.DEFAULT_GOAL := help

APP_NAME      := partiq-sav
POSTGRES_USER     ?= postgres
POSTGRES_PASSWORD ?= postgres
POSTGRES_DB       ?= partiq_sav
POSTGRES_PORT     ?= 5432
LOCAL_DATABASE_URL ?= postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable

GREEN   := $(shell tput setaf 2 2>/dev/null || echo "")
YELLOW  := $(shell tput setaf 3 2>/dev/null || echo "")
RED     := $(shell tput setaf 1 2>/dev/null || echo "")
BLUE    := $(shell tput setaf 4 2>/dev/null || echo "")
MAGENTA := $(shell tput setaf 5 2>/dev/null || echo "")
CYAN    := $(shell tput setaf 6 2>/dev/null || echo "")
GRAY    := $(shell tput setaf 8 2>/dev/null || tput setaf 7 2>/dev/null || echo "")
BOLD    := $(shell tput bold 2>/dev/null || echo "")
NC      := $(shell tput sgr0 2>/dev/null || echo "")

setup: ## ✨ PREMIER LANCEMENT — installe, build Docker, migre et seed
	@if [ ! -f .env ]; then \
		printf "$(RED)Erreur : fichier .env manquant.$(NC)\n"; \
		printf "  → $(BOLD)cp .env.example .env$(NC) puis renseigner GROQ_API_KEY\n"; \
		exit 1; \
	fi
	@printf "$(CYAN)Installation des dépendances Node...$(NC)\n"
	@npm install
	@printf "$(YELLOW)Libération du port 5432 si occupé...$(NC)\n"
	@docker ps --format "{{.ID}}" --filter "publish=5432" | xargs -r docker stop 2>/dev/null || true
	@printf "$(GREEN)Démarrage de la stack Docker...$(NC)\n"
	@docker compose up -d --build
	@printf "$(YELLOW)Attente de Postgres...$(NC)\n"
	@until docker compose exec -T postgres pg_isready -U $(POSTGRES_USER) -d $(POSTGRES_DB) >/dev/null 2>&1; do sleep 1; done
	@printf "$(YELLOW)Application des migrations...$(NC)\n"
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" ./node_modules/.bin/prisma migrate deploy
	@printf "$(YELLOW)Insertion des données de démonstration...$(NC)\n"
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" npm run db:seed
	@printf "\n$(GREEN)$(BOLD)✓ PartiQ SAV est prêt !$(NC)\n"
	@printf "  App     : $(BOLD)http://localhost:3000$(NC)\n"
	@printf "  Adminer : $(BOLD)http://localhost:8080$(NC)\n"
	@printf "  Login   : $(BOLD)admin@partiq.fr$(NC) / $(BOLD)admin123$(NC)\n\n"

help: ## Afficher l'aide
	@printf "$(BOLD)$(CYAN)PartiQ SAV$(NC)\n\n"
	@printf "$(BOLD)$(GREEN)Premier lancement$(NC)\n"
	@grep -E '^(setup):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-22s$(NC) %s\n", $$1, $$2}'
	@printf "\n$(BOLD)$(CYAN)Dev$(NC)\n"
	@grep -E '^(dev):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-22s$(NC) %s\n", $$1, $$2}'
	@printf "\n$(BOLD)$(YELLOW)Base de données$(NC)\n"
	@grep -E '^(db-up|db-wait|db-down|db-migrate|db-reset|db-seed|db-studio|db-bootstrap):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-22s$(NC) %s\n", $$1, $$2}'
	@printf "\n$(BOLD)$(BLUE)Qualité & Build$(NC)\n"
	@grep -E '^(lint|build):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-22s$(NC) %s\n", $$1, $$2}'
	@printf "\n$(BOLD)$(GREEN)Docker$(NC)\n"
	@grep -E '^(docker-up|docker-down|docker-logs|docker-migrate|docker-seed):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-22s$(NC) %s\n", $$1, $$2}'
	@printf "\n$(BOLD)$(RED)Utilitaires$(NC)\n"
	@grep -E '^(clean):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(RED)%-22s$(NC) %s\n", $$1, $$2}'
	@printf "\n"

# -----------------------
# Dev
# -----------------------

dev: ## Démarrer le serveur de développement Next.js (port 3000)
	@printf "$(CYAN)Démarrage PartiQ SAV en dev...$(NC)\n"
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" npm run dev

# -----------------------
# Base de données (Postgres local via Docker)
# -----------------------

db-up: ## Démarrer le conteneur Postgres local
	@docker compose up -d postgres
	@$(MAKE) db-wait

db-wait: ## Attendre que Postgres soit prêt
	@printf "$(YELLOW)Attente de Postgres...$(NC)\n"
	@until docker compose exec -T postgres pg_isready -U $(POSTGRES_USER) -d $(POSTGRES_DB) >/dev/null 2>&1; do \
		sleep 1; \
	done
	@printf "$(GREEN)Postgres est prêt.$(NC)\n"

db-down: ## Arrêter le conteneur Postgres local
	@docker compose stop postgres

db-migrate: ## Appliquer les migrations Prisma
	@printf "$(YELLOW)Application des migrations...$(NC)\n"
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" npx prisma migrate deploy
	@printf "$(GREEN)Migrations appliquées.$(NC)\n"

db-reset: ## Réinitialiser la base de données (supprime toutes les données !)
	@printf "$(RED)Réinitialisation de la base de données...$(NC)\n"
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" npx prisma migrate reset --force
	@printf "$(GREEN)Base réinitialisée.$(NC)\n"

db-seed: ## Insérer les données de démonstration
	@printf "$(YELLOW)Insertion des données de démonstration...$(NC)\n"
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" npm run db:seed
	@printf "$(GREEN)Données insérées.$(NC)\n"

db-studio: ## Ouvrir Prisma Studio (interface DB graphique)
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" npx prisma studio

db-bootstrap: db-up db-migrate db-seed ## Démarrage complet : Postgres + migrations + seed
	@printf "$(GREEN)✓ Base de données prête pour le développement.$(NC)\n"
	@printf "  Utilisateurs : $(BOLD)admin@partiq.fr$(NC) / $(BOLD)agent@partiq.fr$(NC)\n"
	@printf "  Mot de passe admin : $(BOLD)admin123$(NC)\n"
	@printf "  Mot de passe agent : $(BOLD)agent123$(NC)\n"

# -----------------------
# Qualité & Build
# -----------------------

lint: ## Linter le code (ESLint + TypeScript)
	@printf "$(BLUE)Vérification du code...$(NC)\n"
	@npm run lint
	@npx tsc --noEmit
	@printf "$(GREEN)Code valide.$(NC)\n"

build: ## Construire le bundle de production Next.js
	@printf "$(MAGENTA)Build de production...$(NC)\n"
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" npx prisma generate
	@npm run build
	@printf "$(GREEN)Build terminé.$(NC)\n"

# -----------------------
# Docker (stack complète)
# -----------------------

docker-up: ## Démarrer la stack complète (Postgres + App + Adminer)
	@printf "$(YELLOW)Libération du port 5432 si occupé...$(NC)\n"
	@docker ps --format "{{.ID}}" --filter "publish=5432" | xargs -r docker stop 2>/dev/null || true
	@printf "$(GREEN)Démarrage de la stack Docker...$(NC)\n"
	@docker compose up -d --build
	@printf "$(GREEN)Stack démarrée.$(NC)\n"
	@printf "  App     : $(BOLD)http://localhost:3000$(NC)\n"
	@printf "  Adminer : $(BOLD)http://localhost:8080$(NC)\n"

docker-down: ## Arrêter la stack Docker
	@docker compose down --remove-orphans

docker-logs: ## Afficher les logs Docker en temps réel
	@docker compose logs -f

docker-migrate: ## Appliquer les migrations (depuis l'hôte vers le Postgres Docker)
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" ./node_modules/.bin/prisma migrate deploy

docker-seed: ## Insérer les données de démo (depuis l'hôte vers le Postgres Docker)
	@DATABASE_URL="$(LOCAL_DATABASE_URL)" npm run db:seed

# -----------------------
# Utilitaires
# -----------------------

clean: ## Supprimer node_modules, .next, et les artefacts de build
	@printf "$(RED)Nettoyage...$(NC)\n"
	@rm -rf node_modules .next out
	@printf "$(GREEN)Nettoyage terminé.$(NC)\n"
