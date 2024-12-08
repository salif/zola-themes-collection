import os

# 遍历当前目录下的所有文件
for filename in os.listdir('.'):
    if filename.endswith('.md'):
        file_path = os.path.join('.', filename)

        # 尝试使用UTF-8编码读取文件
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
        except UnicodeDecodeError:
            # 如果UTF-8解码失败，尝试忽略错误
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()

        # 将内容写回文件，确保使用UTF-8编码
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)

        print(f'{filename} has been processed.')