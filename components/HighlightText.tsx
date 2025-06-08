'use client'

import { useState } from 'react'

interface HighlightTextProps {
  text: string
  onElementClick?: (element: string) => void
}

// 定义不同类别的颜色 - 简化版，基于元素内容判断
const getElementColor = (element: string): string => {
  // 简单的关键词匹配来确定颜色
  const plantKeywords = ['花', '树', '草', '叶', '果', '荆棘', '玫瑰', '莲花', '牡丹', '菊花', '松树', '柳树', '橡树']
  const foodKeywords = ['面包', '酒', '茶', '水', '肉', '鱼', '果汁', '米饭', '馒头']
  const weaponKeywords = ['剑', '刀', '弓', '箭', '盾', '矛', '斧', '匕首', '宝剑', '利剑', '长剑']
  const treasureKeywords = ['黄金', '白银', '珠宝', '宝石', '钻石', '宝物', '珍宝', '金币']
  const animalKeywords = ['马', '鸟', '龙', '凤凰', '老虎', '狮子', '鹰', '骏马', '战马']
  const placeKeywords = ['宫殿', '城堡', '花园', '沙漠', '森林', '山脉', '城市', '房间']
  const peopleKeywords = ['国王', '王子', '公主', '商人', '士兵', '法师', '盗贼']
  const clothingKeywords = ['长袍', '头冠', '王冠', '项链', '手镯', '袈裟', '斗篷']

  if (plantKeywords.some(keyword => element.includes(keyword))) {
    return 'bg-green-400/30 text-green-700 border-green-400'
  }
  if (foodKeywords.some(keyword => element.includes(keyword))) {
    return 'bg-yellow-400/30 text-yellow-700 border-yellow-400'
  }
  if (weaponKeywords.some(keyword => element.includes(keyword))) {
    return 'bg-red-400/30 text-red-700 border-red-400'
  }
  if (treasureKeywords.some(keyword => element.includes(keyword))) {
    return 'bg-purple-400/30 text-purple-700 border-purple-400'
  }
  if (animalKeywords.some(keyword => element.includes(keyword))) {
    return 'bg-blue-400/30 text-blue-700 border-blue-400'
  }
  if (placeKeywords.some(keyword => element.includes(keyword))) {
    return 'bg-indigo-400/30 text-indigo-700 border-indigo-400'
  }
  if (peopleKeywords.some(keyword => element.includes(keyword))) {
    return 'bg-pink-400/30 text-pink-700 border-pink-400'
  }
  if (clothingKeywords.some(keyword => element.includes(keyword))) {
    return 'bg-orange-400/30 text-orange-700 border-orange-400'
  }
  
  return 'bg-gray-400/30 text-gray-700 border-gray-400'
}

export default function HighlightText({ text, onElementClick }: HighlightTextProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)

  // 解析标记的文本，提取{{}}中的元素
  const parseMarkedText = () => {
    const parts: JSX.Element[] = []
    const regex = /\{\{([^}]+)\}\}/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // 添加元素前的普通文本
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index)
        parts.push(
          <span key={`before-${match.index}`} className="whitespace-pre-wrap">
            {beforeText}
          </span>
        )
      }

      // 添加高亮的元素
      const element = match[1]
      const colorClass = getElementColor(element)
      
      parts.push(
        <span
          key={`element-${match.index}`}
          className={`
            inline-block px-1 py-0.5 mx-0.5 rounded border cursor-pointer
            transition-all duration-200 hover:scale-105 hover:shadow-md
            ${colorClass}
          `}
          onClick={() => onElementClick?.(element)}
          onMouseEnter={() => setHoveredElement(element)}
          onMouseLeave={() => setHoveredElement(null)}
          title={`元素: ${element}`}
        >
          {element}
        </span>
      )

      lastIndex = regex.lastIndex
    }

    // 添加最后剩余的文本
    if (lastIndex < text.length) {
      const afterText = text.slice(lastIndex)
      parts.push(
        <span key="after" className="whitespace-pre-wrap">
          {afterText}
        </span>
      )
    }

    return parts
  }

  return (
    <div className="relative">
      <div className="whitespace-pre-wrap leading-relaxed">
        {parseMarkedText()}
      </div>
      
      {/* 悬停提示框 */}
      {hoveredElement && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-black/80 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
          <div className="font-medium">{hoveredElement}</div>
          <div className="text-gray-300">
            故事元素
          </div>
        </div>
      )}
    </div>
  )
} 