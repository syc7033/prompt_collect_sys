@echo off
echo 正在修复依赖问题...
echo 1. 删除node_modules文件夹和package-lock.json
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next

echo 2. 重新安装依赖
call npm install

echo 3. 清除Next.js缓存
call npx next clear

echo 修复完成！
echo 现在可以运行 npm run dev 启动应用
pause
