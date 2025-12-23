// 新增理由：干支历转换
// 回滚方式：回退此文件

import { STEMS, BRANCHES } from '../utils/constants.js';
import { mod } from '../utils/math.js';
import { jdnUTC } from '../utils/math.js';

/**
 * 根据年份获取年柱干支
 */
export function ganzhiOfYear(year) {
  const idx = ((year - 1984) % 60 + 60) % 60;
  return STEMS[idx % 10] + BRANCHES[idx % 12];
}

/**
 * 根据立春确定年柱
 */
export function yearPillarByLichun(dateUTC, lichunUTC) {
  const year = dateUTC.getUTCFullYear();
  const y = dateUTC < lichunUTC ? year - 1 : year;
  const base = 1984;
  const idx = mod(y - base, 60);
  return {
    stem: STEMS[mod(idx, 10)],
    branch: BRANCHES[mod(idx, 12)]
  };
}

/**
 * 根据月支计算月柱
 */
export function monthPillar(yearStem, monthBranch) {
  const MONTH_STEM_BY_YEAR_STEM = {
    "甲": ["丙","丁","戊","己","庚","辛","壬","癸","甲","乙","丙","丁"],
    "己": ["丙","丁","戊","己","庚","辛","壬","癸","甲","乙","丙","丁"],
    "乙": ["戊","己","庚","辛","壬","癸","甲","乙","丙","丁","戊","己"],
    "庚": ["戊","己","庚","辛","壬","癸","甲","乙","丙","丁","戊","己"],
    "丙": ["庚","辛","壬","癸","甲","乙","丙","丁","戊","己","庚","辛"],
    "辛": ["庚","辛","壬","癸","甲","乙","丙","丁","戊","己","庚","辛"],
    "丁": ["壬","癸","甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],
    "壬": ["壬","癸","甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],
    "戊": ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸","甲","乙"],
    "癸": ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸","甲","乙"]
  };
  
  const arr = MONTH_STEM_BY_YEAR_STEM[yearStem];
  if (!arr) {
    throw new Error(`Invalid year stem: ${yearStem}`);
  }
  
  const branches = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];
  const i = branches.indexOf(monthBranch);
  if (i === -1) {
    throw new Error(`Invalid month branch: ${monthBranch}`);
  }
  
  return {
    stem: arr[i],
    branch: monthBranch
  };
}

/**
 * 计算日柱
 */
export function dayPillar(dateUTC) {
  const EPOCH = { jdn: 2415020.5, index: 10 };
  const idx = mod(Math.floor(jdnUTC(dateUTC) - EPOCH.jdn) + EPOCH.index, 60);
  return {
    stem: STEMS[mod(idx, 10)],
    branch: BRANCHES[mod(idx, 12)]
  };
}
