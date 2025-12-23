-- 为 messages 表添加 follow_ups 字段
-- 用于存储 AI 回复后的追问建议（最多3个）

ALTER TABLE messages 
ADD COLUMN follow_ups JSON COMMENT '追问建议数组，如 ["问题1", "问题2", "问题3"]'
AFTER content;

-- 添加索引以优化查询
CREATE INDEX idx_follow_ups ON messages(message_id, (JSON_LENGTH(follow_ups)));

