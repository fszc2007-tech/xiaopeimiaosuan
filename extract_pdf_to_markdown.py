#!/usr/bin/env python3
"""
PDF 文字提取脚本
将 PDF 文件提取为 Markdown 格式
"""

import sys
import os
import re

def extract_pdf_to_markdown(pdf_path, output_path):
    """提取 PDF 文字并转换为 Markdown"""
    try:
        # 尝试使用 pypdf (新版本)
        from pypdf import PdfReader
        reader = PdfReader(pdf_path)
    except ImportError:
        try:
            # 尝试使用 PyPDF2 (旧版本)
            from PyPDF2 import PdfReader
            reader = PdfReader(pdf_path, strict=False)
        except ImportError:
            print("❌ 错误: 请先安装 PDF 库")
            print("   安装命令: pip3 install pypdf")
            sys.exit(1)
    
    # 提取所有页面的文字
    text = ""
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n\n"
    
    # 清理和格式化文本
    # 移除多余的空行
    text = re.sub(r'\n{3,}', '\n\n', text)
    # 移除行首行尾空格
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    
    # 简单的 Markdown 格式化
    # 检测可能的标题（全大写或特定格式）
    lines = text.split('\n')
    formatted_lines = []
    
    for i, line in enumerate(lines):
        if not line.strip():
            formatted_lines.append('')
            continue
        
        # 如果行很短且看起来像标题，添加 ##
        # 这里可以根据实际 PDF 内容调整规则
        if len(line) < 50 and line.strip() and i < len(lines) - 1:
            # 检查下一行是否为空或较短
            if i + 1 < len(lines) and (not lines[i + 1].strip() or len(lines[i + 1]) < 100):
                # 可能是标题，但不自动添加，保持原样
                formatted_lines.append(line)
            else:
                formatted_lines.append(line)
        else:
            formatted_lines.append(line)
    
    markdown = '\n'.join(formatted_lines)
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 写入文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown)
    
    print(f"✅ 已提取: {os.path.basename(pdf_path)} -> {os.path.basename(output_path)}")
    print(f"   页数: {len(reader.pages)}")
    print(f"   字符数: {len(markdown)}")
    return True

def main():
    """主函数"""
    print("📄 PDF 文字提取脚本")
    print("=" * 50)
    
    # 定义文件映射
    files = [
        {
            'pdf': 'core/public/docs/miaosuan_privacy_policy_zh-HK.pdf',
            'md': 'app/src/assets/policies/privacy-policy-zh-HK.md',
            'name': '私隐政策'
        },
        {
            'pdf': 'core/public/docs/miaosuan_user_agreement_zh-HK.pdf',
            'md': 'app/src/assets/policies/user-agreement-zh-HK.md',
            'name': '用户协议'
        },
        {
            'pdf': 'core/public/docs/miaosuan_PICS_zh-HK.pdf',
            'md': 'app/src/assets/policies/pics-zh-HK.md',
            'name': '个人资料收集声明'
        }
    ]
    
    success_count = 0
    for file_info in files:
        pdf_path = file_info['pdf']
        md_path = file_info['md']
        name = file_info['name']
        
        if not os.path.exists(pdf_path):
            print(f"❌ 文件不存在: {pdf_path}")
            continue
        
        print(f"\n📖 处理: {name}")
        try:
            if extract_pdf_to_markdown(pdf_path, md_path):
                success_count += 1
        except Exception as e:
            print(f"❌ 提取失败: {e}")
    
    print("\n" + "=" * 50)
    print(f"✅ 完成! 成功提取 {success_count}/{len(files)} 个文件")
    print("\n💡 提示: 提取的 Markdown 文件可能需要手动调整格式")
    print("   请检查以下文件:")
    for file_info in files:
        print(f"   - {file_info['md']}")

if __name__ == '__main__':
    main()

