import uvicorn

if __name__ == "__main__":
    # 使用0.0.0.0而不是localhost，以允许外部访问
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
