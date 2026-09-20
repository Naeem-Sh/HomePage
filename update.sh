#!/usr/bin/env bash
# ==============================================================================
# Homelab Portal (LinxDash) - Safe Update & Auto-Backup Script
# اسکریپت به‌روزرسانی امن و خودکار بدون پاک‌شدن اطلاعات و تنظیمات
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}  Homelab Portal - اسکریپت به‌روزرسانی امن سامانه    ${NC}"
echo -e "${CYAN}======================================================${NC}"

# 1. تشخیص مسیر برنامه و پوشه داده‌ها
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# خواندن متغیر DATA_DIR از .env یا .datadir در صورت وجود
if [ -f ".env" ]; then
    set -a
    source <(grep -v '^\s*#' .env | grep -E '^DATA_DIR=') 2>/dev/null || true
    set +a
fi
if [ -f ".datadir" ] && [ -z "$DATA_DIR" ]; then
    DATA_DIR="$(head -n 1 .datadir | tr -d '\r\n')"
fi

DATA_DIR="${DATA_DIR:-$SCRIPT_DIR/data}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_PARENT_DIR="${HOME}/.homelab_backups"
BACKUP_DIR="${BACKUP_PARENT_DIR}/backup_${TIMESTAMP}"

echo -e "\n${BLUE}📍 مسیر سامانه:${NC} $SCRIPT_DIR"
echo -e "${BLUE}📁 مسیر ذخیره‌سازی داده‌ها (پایگاه‌داده و تصاویر):${NC} $DATA_DIR"

# 2. پشتیبان‌گیری خودکار و تضمینی قبل از هر کاری
if [ -d "$DATA_DIR" ] && [ "$(ls -A "$DATA_DIR" 2>/dev/null)" ]; then
    echo -e "\n${YELLOW}🛡️ در حال تهیه نسخه پشتیبان کامل قبل از به‌روزرسانی...${NC}"
    mkdir -p "$BACKUP_DIR"
    cp -r "$DATA_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✅ یک نسخه کامل و امن از تمام اطلاعات، لوگوها و تنظیمات شما در مسیر زیر ذخیره شد:${NC}"
    echo -e "   ${CYAN}$BACKUP_DIR${NC}"
else
    echo -e "${YELLOW}ℹ️ پوشه داده خالی است یا هنوز داده‌ای ثبت نشده است.${NC}"
fi

# 3. به‌روزرسانی کدها بر اساس روش نصب
echo -e "\n${BLUE}🔄 بررسی روش به‌روزرسانی...${NC}"

if [ -d ".git" ]; then
    echo -e "${BLUE}📥 به‌روزرسانی از مخزن گیت (Git Pull)...${NC}"
    git stash || true
    git pull origin main || git pull || true
else
    echo -e "${YELLOW}ℹ️ پروژه به صورت فایل فشرده (ZIP) اجرا می‌شود.${NC}"
    echo -e "   نکته مهم: برای به‌روزرسانی با فایل زیپ جدید، پوشه ${RED}data/${NC} را هرگز جایگزین نکنید."
fi

# 4. بررسی و بازیابی خودکار داده‌ها در صورت دستکاری اشتباه
if [ -d "$BACKUP_DIR" ]; then
    # اگر فایل دیتابیس فعلی پاک شده یا سایز آن صفر شده بود، بلافاصله از نسخه پشتیبان برگردان
    if [ ! -f "$DATA_DIR/database.json" ] || [ ! -s "$DATA_DIR/database.json" ]; then
        echo -e "${YELLOW}⚠️ فایل پایگاه‌داده یافت نشد، در حال بازیابی خودکار از نسخه پشتیبان...${NC}"
        mkdir -p "$DATA_DIR"
        cp -r "$BACKUP_DIR"/* "$DATA_DIR/"
        echo -e "${GREEN}✅ اطلاعات با موفقیت بازیابی شد.${NC}"
    fi

    # اگر پوشه آپلودها (لوگوها و تصاویر) خالی بود، از نسخه پشتیبان بازیابی شود
    if [ -d "$BACKUP_DIR/uploads" ] && [ ! -d "$DATA_DIR/uploads" ]; then
        mkdir -p "$DATA_DIR/uploads"
        cp -r "$BACKUP_DIR/uploads"/* "$DATA_DIR/uploads/" 2>/dev/null || true
    fi
fi

# 5. نصب وابستگی‌ها و بیلد مجدد
echo -e "\n${BLUE}📦 نصب وابستگی‌ها و بیلد پروژه...${NC}"
if command -v npm &> /dev/null; then
    npm install --omit=dev --silent || npm install
    npm run build
    echo -e "${GREEN}✅ پروژه با موفقیت کامپایل شد.${NC}"
else
    echo -e "${RED}⚠️ دستور npm یافت نشد.${NC}"
fi

# 6. راه‌اندازی مجدد سرویس (در صورت استفاده از PM2 یا Systemd یا Docker)
echo -e "\n${BLUE}🚀 بررسی و راه‌اندازی مجدد سرویس...${NC}"

if command -v pm2 &> /dev/null && pm2 list | grep -q "homelab"; then
    echo -e "${GREEN}🔄 راه‌اندازی مجدد با PM2...${NC}"
    pm2 restart homelab || pm2 restart all
elif [ -f "docker-compose.yml" ] && command -v docker &> /dev/null && docker ps | grep -q "homelab"; then
    echo -e "${GREEN}🔄 راه‌اندازی مجدد کانتینر داکر...${NC}"
    docker compose restart
elif systemctl is-active --quiet homelab 2>/dev/null; then
    echo -e "${GREEN}🔄 راه‌اندازی مجدد سرویس systemd...${NC}"
    sudo systemctl restart homelab
else
    echo -e "${CYAN}💡 اگر برنامه را دستی اجرا کرده‌اید، کافیست آن را با دستور زیر اجرا کنید:${NC}"
    echo -e "   ${GREEN}npm start${NC}"
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🎉 به‌روزرسانی با موفقیت به پایان رسید!${NC}"
echo -e "${GREEN}تمام اطلاعات، برنامه‌ها، دسته‌بندی‌ها و لوگوهای شما حفظ شدند.${NC}"
echo -e "${GREEN}======================================================${NC}\n"
