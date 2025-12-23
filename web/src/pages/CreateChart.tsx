/**
 * 手動排盤頁面（H5 版）
 * 
 * ✅ 嚴格按照 App 端邏輯和 UI 風格實現
 * ✅ 繁體中文
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chartService } from '@/services/api/chartService';
import { BirthInputVM, DEFAULT_BIRTH_INPUT, CalendarType } from '@/types/birth';
import './CreateChart.css';

interface BaziFormData {
  gender: 'male' | 'female' | null;
  calendarType: 'solar' | 'lunar' | null;
  name?: string;
  birthPlace?: string;
}

export const CreateChartPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<BaziFormData>({
    gender: null,
    calendarType: null,
    name: '',
    birthPlace: '',
  });
  
  // 出生信息（用於日期時間選擇器）
  const [birthInput, setBirthInput] = useState<BirthInputVM>({
    ...DEFAULT_BIRTH_INPUT,
    calendarType: 'solar',
  });
  
  // 出生信息彈窗顯示狀態
  const [birthPickerVisible, setBirthPickerVisible] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // 同步 birthInput 到 formData（用於顯示）
  React.useEffect(() => {
    setFormData({
      ...formData,
      calendarType: birthInput.calendarType,
    });
  }, [birthInput.calendarType]);
  
  // 曆法雙向聯動：基礎信息頁 → 彈窗
  React.useEffect(() => {
    if (formData.calendarType) {
      setBirthInput({
        ...birthInput,
        calendarType: formData.calendarType,
      });
    }
  }, [formData.calendarType]);

  const isFormValid = () => {
    return (
      formData.gender &&
      formData.calendarType &&
      birthInput.year &&
      birthInput.month &&
      birthInput.day &&
      birthInput.hour !== null &&
      birthInput.minute !== null
    );
  };

  // 處理出生信息彈窗確認
  const handleBirthInputConfirm = (value: BirthInputVM) => {
    setBirthInput(value);
    // 同步曆法到基礎信息頁
    setFormData({
      ...formData,
      calendarType: value.calendarType,
    });
    setBirthPickerVisible(false);
  };
  
  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert('請填寫完整信息');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestData: any = {
        name: formData.name || '未命名',
        gender: formData.gender!,
        birth: {
          year: birthInput.year,
          month: birthInput.month,
          day: birthInput.day,
          hour: birthInput.hour,
          minute: birthInput.minute,
          calendar_type: birthInput.calendarType,
        },
        timezone_offset_minutes: birthInput.timezoneOffsetMinutes,
        is_dst: birthInput.isDst,
        ...(formData.birthPlace && { 
          birth_place: formData.birthPlace,
          notes: `出生地：${formData.birthPlace}` 
        }),
      };
      
      console.log('📤 提交排盤數據:', requestData);
      
      const result = await chartService.computeChart(requestData);
      
      console.log('✅ 命盤創建成功:', result);
      
      // 獲取返回的命盤 ID
      const chartId = result.chartId || result.data?.chartId;
      const profileId = result.profileId || result.data?.profileId;
      
      console.log('📊 命盤ID:', chartId, '檔案ID:', profileId);
      
      if (chartId && profileId) {
        // 直接跳轉到命盤詳情頁
        navigate(`/chart/${chartId}`, { replace: true });
      } else if (chartId) {
        // 如果只有 chartId，也跳轉
        navigate(`/chart/${chartId}`, { replace: true });
      } else {
        // 如果沒有返回 ID，顯示成功提示並返回列表
        alert('命盤創建成功！');
        navigate('/charts');
      }
    } catch (error: any) {
      console.error('❌ 創建命盤失敗:', error);
      alert(error.message || '創建命盤失敗，請稍後重試');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="create-chart-page">
      {/* 漸變背景 */}
      <div className="gradient-background"></div>
      
      <div className="create-chart-container">
        {/* 頂部欄 */}
        <div className="create-chart-header">
          <button className="back-button" onClick={() => navigate('/charts')}>
            ←
          </button>
          <div className="header-center">
            <h1 className="header-title">排盤，開啟生命之旅</h1>
          </div>
          <div className="header-right"></div>
        </div>
        
        <div className="create-chart-content">
          {/* 基本出生信息（必填） */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-title-container">
                <h2 className="card-title">基本資訊</h2>
                <span className="required-badge">必填</span>
              </div>
            </div>
            
            {/* 性別和曆法 - 同一行 */}
            <div className="row-container">
              {/* 性別 */}
              <div className="half-field">
                <div className="field-label-row">
                  <span className="field-icon">👤</span>
                  <label className="field-label">性別</label>
                </div>
                <div className="chip-container">
                  <button
                    className={`chip chip-small ${formData.gender === 'male' ? 'chip-selected' : ''}`}
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                  >
                    <span className="chip-icon">👤</span>
                    <span className={`chip-text chip-text-small ${formData.gender === 'male' ? 'chip-text-selected' : ''}`}>
                      男
                    </span>
                  </button>
                  <button
                    className={`chip chip-small ${formData.gender === 'female' ? 'chip-selected' : ''}`}
                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                  >
                    <span className="chip-icon">👤</span>
                    <span className={`chip-text chip-text-small ${formData.gender === 'female' ? 'chip-text-selected' : ''}`}>
                      女
                    </span>
                  </button>
                </div>
              </div>
              
              {/* 曆法 */}
              <div className="half-field">
                <div className="field-label-row">
                  <span className="field-icon">📅</span>
                  <label className="field-label">曆法</label>
                </div>
                <div className="chip-container">
                  <button
                    className={`chip chip-small ${formData.calendarType === 'solar' ? 'chip-selected' : ''}`}
                    onClick={() => setFormData({ ...formData, calendarType: 'solar' })}
                  >
                    <span className="chip-icon">📅</span>
                    <span className={`chip-text chip-text-small ${formData.calendarType === 'solar' ? 'chip-text-selected' : ''}`}>
                      公曆
                    </span>
                  </button>
                  <button
                    className={`chip chip-small ${formData.calendarType === 'lunar' ? 'chip-selected' : ''}`}
                    onClick={() => setFormData({ ...formData, calendarType: 'lunar' })}
                  >
                    <span className="chip-icon">📅</span>
                    <span className={`chip-text chip-text-small ${formData.calendarType === 'lunar' ? 'chip-text-selected' : ''}`}>
                      農曆
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 出生日期 */}
            <div className="field-container">
              <div className="field-label-row">
                <span className="field-icon">📅</span>
                <label className="field-label">出生日期</label>
              </div>
              <button
                className="date-time-input"
                onClick={() => setBirthPickerVisible(true)}
              >
                <span className="date-time-input-text">
                  {birthInput.year}年{birthInput.month}月{birthInput.day}日
                </span>
                <span className="chevron-down">▼</span>
              </button>
            </div>
            
            {/* 出生時間 */}
            <div className="field-container">
              <div className="field-label-row">
                <span className="field-icon">🕐</span>
                <label className="field-label">出生時間</label>
              </div>
              <button
                className="date-time-input"
                onClick={() => setBirthPickerVisible(true)}
              >
                <span className="date-time-input-text">
                  {birthInput.hour.toString().padStart(2, '0')}:{birthInput.minute.toString().padStart(2, '0')}
                </span>
                <span className="chevron-down">▼</span>
              </button>
            </div>
          </div>
          
          {/* 更多選項（可選） */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-title-container">
                <h2 className="card-title">更多信息</h2>
                <span className="optional-badge">可選</span>
              </div>
            </div>
            
            {/* 案例名稱 */}
            <div className="field-container">
              <div className="field-label-row">
                <span className="field-icon">📝</span>
                <label className="field-label">案例名稱</label>
              </div>
              <input
                type="text"
                className={`text-input ${focusedField === 'name' ? 'text-input-focused' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：張三、李四"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            
            {/* 出生城市 */}
            <div className="field-container">
              <div className="field-label-row">
                <span className="field-icon">📍</span>
                <label className="field-label">出生城市</label>
              </div>
              <input
                type="text"
                className={`text-input ${focusedField === 'birthPlace' ? 'text-input-focused' : ''}`}
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                placeholder="例如：北京、上海、香港"
                onFocus={() => setFocusedField('birthPlace')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>
          
          {/* 底部留白 */}
          <div style={{ height: '100px' }}></div>
        </div>
        
        {/* 底部按鈕 */}
        <div className="create-chart-footer">
          <button
            className={`submit-button ${!isFormValid() ? 'submit-button-disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
          >
            <span className="button-icon">✨</span>
            <span className="submit-button-text">
              {isSubmitting ? '提交中...' : '開始排盤'}
            </span>
          </button>
        </div>
      </div>

      {/* 出生信息選擇彈窗 */}
      {birthPickerVisible && (
        <BirthDateTimePicker
          initialValue={birthInput}
          onConfirm={handleBirthInputConfirm}
          onCancel={() => setBirthPickerVisible(false)}
        />
      )}
    </div>
  );
};

// 日期時間選擇器組件（Web 版）
interface BirthDateTimePickerProps {
  initialValue: BirthInputVM;
  onConfirm: (value: BirthInputVM) => void;
  onCancel: () => void;
}

const BirthDateTimePicker: React.FC<BirthDateTimePickerProps> = ({
  initialValue,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState<BirthInputVM>(initialValue);
  const [calendarType, setCalendarType] = useState<CalendarType>(initialValue.calendarType);
  
  React.useEffect(() => {
    setValue(initialValue);
    setCalendarType(initialValue.calendarType);
  }, [initialValue]);
  
  // 生成選項數組
  const years = Array.from({ length: 126 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  
  // 根據年月計算天數（公曆）
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const days = React.useMemo(() => {
    const daysCount = getDaysInMonth(value.year, value.month);
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }, [value.year, value.month]);
  
  const handleConfirm = () => {
    onConfirm({
      ...value,
      calendarType,
    });
  };
  
  return (
    <div className="birth-picker-overlay" onClick={onCancel}>
      <div className="birth-picker-container" onClick={(e) => e.stopPropagation()}>
        {/* 標題欄 */}
        <div className="birth-picker-header">
          <button className="birth-picker-cancel" onClick={onCancel}>取消</button>
          <h3 className="birth-picker-title">選擇出生信息</h3>
          <button className="birth-picker-confirm" onClick={handleConfirm}>確定</button>
        </div>

        {/* 曆法 Tab */}
        <div className="birth-picker-tabs">
          <button
            className={`birth-picker-tab ${calendarType === 'solar' ? 'active' : ''}`}
            onClick={() => setCalendarType('solar')}
          >
            公曆
          </button>
          <button
            className={`birth-picker-tab ${calendarType === 'lunar' ? 'active' : ''}`}
            onClick={() => setCalendarType('lunar')}
          >
            農曆
          </button>
        </div>

        {/* 滾輪區域 */}
        <div className="birth-picker-wheels">
          <div className="birth-picker-wheel">
            <label>年</label>
            <select
              value={value.year}
              onChange={(e) => setValue({ ...value, year: parseInt(e.target.value) })}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="birth-picker-wheel">
            <label>月</label>
            <select
              value={value.month}
              onChange={(e) => setValue({ ...value, month: parseInt(e.target.value) })}
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div className="birth-picker-wheel">
            <label>日</label>
            <select
              value={value.day}
              onChange={(e) => setValue({ ...value, day: parseInt(e.target.value) })}
            >
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          
          <div className="birth-picker-wheel">
            <label>時</label>
            <select
              value={value.hour}
              onChange={(e) => setValue({ ...value, hour: parseInt(e.target.value) })}
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          
          <div className="birth-picker-wheel">
            <label>分</label>
            <select
              value={value.minute}
              onChange={(e) => setValue({ ...value, minute: parseInt(e.target.value) })}
            >
              {minutes.map((minute) => (
                <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 時區 & 夏令時 */}
        <div className="birth-picker-timezone">
          <div className="timezone-row">
            <span className="timezone-label">東八區（北京時間）</span>
            <div className="dst-row">
              <label>夏令時</label>
              <input
                type="checkbox"
                checked={value.isDst}
                onChange={(e) => setValue({ ...value, isDst: e.target.checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


