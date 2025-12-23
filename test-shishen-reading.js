/**
 * 十神解读功能测试脚本
 * 
 * 用于验证：
 * 1. 数据库表是否存在
 * 2. 数据是否正确插入
 * 3. API 是否能正常返回数据
 */

const mysql = require('mysql2/promise');

// 数据库配置（从环境变量读取）
const pool = mysql.createPool({
  host: process.env.XIAOPEI_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.XIAOPEI_MYSQL_PORT || '3306'),
  user: process.env.XIAOPEI_MYSQL_USER || 'root',
  password: process.env.XIAOPEI_MYSQL_PASSWORD || '',
  database: process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
  multipleStatements: true
});

async function testShishenReadings() {
  console.log('🔍 开始测试十神解读功能...\n');

  try {
    // 1. 检查表是否存在
    console.log('1️⃣ 检查数据库表...');
    const [tables] = await pool.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'shishen_readings'`,
      [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']
    );

    if (tables.length === 0) {
      console.log('❌ 表 shishen_readings 不存在！需要先执行迁移文件。');
      console.log('   执行命令: mysql -u root -p xiaopei < core/src/database/migrations/033_create_shishen_readings.sql');
      return;
    }
    console.log('✅ 表 shishen_readings 存在\n');

    // 2. 检查数据数量
    console.log('2️⃣ 检查数据数量...');
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM shishen_readings WHERE is_active = TRUE'
    );
    const count = countResult[0].count;
    console.log(`   总记录数: ${count}`);
    
    if (count === 0) {
      console.log('❌ 没有数据！需要先执行数据插入脚本。');
      console.log('   执行命令: mysql -u root -p xiaopei < core/src/database/migrations/034_insert_shishen_readings.sql');
      return;
    }
    
    if (count < 40) {
      console.log(`⚠️  数据不完整！期望 40 条，实际 ${count} 条`);
    } else {
      console.log('✅ 数据数量正确（40条）\n');
    }

    // 3. 检查每个十神的数据
    console.log('3️⃣ 检查每个十神的数据...');
    const shishenCodes = [
      'bi_jian', 'jie_cai', 'shi_shen', 'shang_guan',
      'zheng_cai', 'pian_cai', 'zheng_guan', 'qi_sha',
      'zheng_yin', 'pian_yin'
    ];

    for (const code of shishenCodes) {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM shishen_readings WHERE shishen_code = ? AND is_active = TRUE',
        [code]
      );
      const count = rows[0].count;
      const status = count === 4 ? '✅' : count > 0 ? '⚠️' : '❌';
      console.log(`   ${status} ${code}: ${count}/4 条记录`);
    }
    console.log('');

    // 4. 测试查询特定十神和柱位
    console.log('4️⃣ 测试查询功能...');
    const testCases = [
      { code: 'bi_jian', pillar: 'year', gender: 'male' },
      { code: 'jie_cai', pillar: 'month', gender: 'female' },
      { code: 'shi_shen', pillar: 'day', gender: 'male' },
      { code: 'zheng_cai', pillar: 'hour', gender: 'female' },
    ];

    for (const testCase of testCases) {
      const [rows] = await pool.execute(
        `SELECT * FROM shishen_readings 
         WHERE shishen_code = ? AND pillar_type = ? AND gender = ? AND is_active = TRUE
         LIMIT 1`,
        [testCase.code, testCase.pillar, testCase.gender]
      );

      if (rows.length > 0) {
        const row = rows[0];
        console.log(`   ✅ ${testCase.code} (${testCase.pillar}, ${testCase.gender}):`);
        console.log(`      名称: ${row.name}`);
        console.log(`      标签: ${row.badge_text}`);
        console.log(`      标题: ${row.short_title}`);
        console.log(`      解读长度: ${row.for_this_position.length} 字符`);
        console.log(`      推荐问题数: ${JSON.parse(row.recommended_questions || '[]').length}`);
      } else {
        console.log(`   ❌ ${testCase.code} (${testCase.pillar}, ${testCase.gender}): 未找到数据`);
      }
    }
    console.log('');

    // 5. 检查数据完整性
    console.log('5️⃣ 检查数据完整性...');
    const [incompleteRows] = await pool.execute(
      `SELECT shishen_code, COUNT(*) as count 
       FROM shishen_readings 
       WHERE is_active = TRUE 
       GROUP BY shishen_code 
       HAVING count < 4`
    );

    if (incompleteRows.length > 0) {
      console.log('   ⚠️  以下十神数据不完整:');
      incompleteRows.forEach(row => {
        console.log(`      ${row.shishen_code}: ${row.count}/4 条`);
      });
    } else {
      console.log('   ✅ 所有十神数据完整（每个都有4个柱位）');
    }

    console.log('\n✅ 测试完成！');
    console.log('\n📝 下一步：');
    console.log('   1. 如果表不存在，执行: mysql -u root -p xiaopei < core/src/database/migrations/033_create_shishen_readings.sql');
    console.log('   2. 如果数据不存在，执行: mysql -u root -p xiaopei < core/src/database/migrations/034_insert_shishen_readings.sql');
    console.log('   3. 重启 Core 服务');
    console.log('   4. 在 App 中点击副星（十神）测试弹窗功能');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('\n可能的原因：');
    console.error('   1. 数据库连接失败');
    console.error('   2. 数据库配置错误');
    console.error('   3. 表或数据不存在');
  } finally {
    await pool.end();
  }
}

// 运行测试
testShishenReadings();


