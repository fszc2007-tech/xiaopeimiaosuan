"use strict";
/**
 * 做功分析诊断脚本
 * 用于检查关系图、路径查找和力度计算的问题
 */
Object.defineProperty(exports, "__esModule", { value: true });
const dogong_js_1 = require("../engine/analysis/dogong.js");
const daymaster_js_1 = require("../engine/analysis/daymaster.js");
// 测试命盘：戊辰 庚申 庚申 丁丑（日主庚金）
const testPillars = {
    year: {
        stem: '戊',
        branch: '辰',
        shishen: '偏印',
        sub_stars: ['偏印', '正财', '伤官']
    },
    month: {
        stem: '庚',
        branch: '申',
        shishen: '比肩',
        sub_stars: ['比肩', '食神', '偏印']
    },
    day: {
        stem: '庚',
        branch: '申',
        shishen: '比肩',
        sub_stars: ['比肩', '食神', '偏印']
    },
    hour: {
        stem: '丁',
        branch: '丑',
        shishen: '正官',
        sub_stars: ['正印', '伤官', '劫财']
    }
};
const testAnalysis = {
    dayMaster: { gan: '庚' },
    strength: (0, daymaster_js_1.computeDayMasterStrength)(testPillars, { school: 'ziping' })
};
async function diagnoseDogong() {
    console.log('🔍 开始诊断做功分析...\n');
    const result = (0, dogong_js_1.analyzeDogong)(testPillars, testAnalysis, { maxPaths: 10 });
    // 1. 检查关系图节点
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣ 关系图节点检查');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('节点数量:', result.graph.nodes.length);
    console.log('节点列表:', result.graph.nodes.map(n => n.id).join(', '));
    // 检查是否包含关键十神
    const keyShishen = ['比肩', '食神', '正官', '偏印'];
    const missingShishen = keyShishen.filter(s => !result.graph.nodes.some(n => n.id === s));
    if (missingShishen.length > 0) {
        console.log('❌ 缺失的关键十神:', missingShishen.join(', '));
    }
    else {
        console.log('✅ 所有关键十神都在图中');
    }
    // 检查是否有"日主"节点
    const hasDayMaster = result.graph.nodes.some(n => n.id === '日主');
    if (!hasDayMaster) {
        console.log('❌ 关系图中没有"日主"节点！这是关键问题！');
    }
    else {
        console.log('✅ 关系图中包含"日主"节点');
    }
    // 2. 检查关系边
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣ 关系边检查');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('边的数量:', result.graph.edges.length);
    // 检查关键关系
    const keyRelations = [
        { from: '比肩', to: '食神', type: '生' },
        { from: '正官', to: '比肩', type: '克' },
        { from: '偏印', to: '比肩', type: '生' }
    ];
    keyRelations.forEach(rel => {
        const found = result.graph.edges.some(e => e.from === rel.from && e.to === rel.to && e.relation === rel.type);
        if (found) {
            console.log(`✅ 找到关系: ${rel.from} --[${rel.type}]--> ${rel.to}`);
        }
        else {
            console.log(`❌ 缺失关系: ${rel.from} --[${rel.type}]--> ${rel.to}`);
        }
    });
    // 检查从"日主"出发的边
    const dayMasterEdges = result.graph.edges.filter(e => e.from === '日主' || e.to === '日主');
    console.log(`\n从"日主"出发/到达的边数量: ${dayMasterEdges.length}`);
    if (dayMasterEdges.length === 0) {
        console.log('❌ 没有从"日主"出发或到达的边！无法找到路径！');
    }
    else {
        console.log('从"日主"的边:', dayMasterEdges.map(e => `${e.from} --[${e.relation}]--> ${e.to}`).join(', '));
    }
    // 3. 检查十神强度
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣ 十神强度检查');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(result.strengthMap).forEach(([shishen, strength]) => {
        console.log(`${shishen}: ${strength.toFixed(2)}`);
    });
    // 4. 检查路径查找结果
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣ 路径查找结果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('找到的路径数量:', result.strongestPaths.length);
    if (result.strongestPaths.length === 0) {
        console.log('❌ 没有找到任何路径！');
    }
    else {
        result.strongestPaths.forEach((path, idx) => {
            console.log(`\n路径 ${idx + 1}:`);
            console.log(`  路径: ${path.path.join(' → ')}`);
            console.log(`  关系: ${path.relations.join(' → ')}`);
            console.log(`  力度: ${path.workForce.toFixed(4)}`);
            console.log(`  类型: ${path.type}`);
            console.log(`  洁净度: ${path.cleanliness.toFixed(4)}`);
        });
    }
    // 5. 检查核心做功线
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('5️⃣ 核心做功线');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (result.coreLine) {
        console.log('✅ 有核心做功线:');
        console.log(`  路径: ${result.coreLine.path.join(' → ')}`);
        console.log(`  力度: ${result.coreLine.workForce.toFixed(4)}`);
        console.log(`  类型: ${result.coreLine.type}`);
    }
    else {
        console.log('❌ 没有核心做功线！');
    }
    // 6. 问题诊断
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('6️⃣ 问题诊断');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const issues = [];
    if (!hasDayMaster) {
        issues.push('关系图中没有"日主"节点，导致无法从"日主"开始搜索路径');
    }
    if (dayMasterEdges.length === 0) {
        issues.push('没有从"日主"出发或到达的边，无法建立"日主"与其他十神的关系');
    }
    if (result.strongestPaths.length === 0) {
        issues.push('没有找到任何路径，可能是路径查找算法的问题');
    }
    if (!result.coreLine) {
        issues.push('没有核心做功线，导致前端显示"未知"');
    }
    if (issues.length === 0) {
        console.log('✅ 未发现明显问题');
    }
    else {
        console.log('发现的问题:');
        issues.forEach((issue, idx) => {
            console.log(`  ${idx + 1}. ${issue}`);
        });
    }
    console.log('\n');
}
// 运行诊断
diagnoseDogong().catch(console.error);
//# sourceMappingURL=debug-dogong.js.map