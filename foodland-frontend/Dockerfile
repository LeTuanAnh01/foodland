
FROM nginx:stable-alpine

# Cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy bản React đã build
COPY dist/ /usr/share/nginx/html/

# Cổng HTTP nội bộ
EXPOSE 80
