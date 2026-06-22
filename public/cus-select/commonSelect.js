// function callback(e, id) {
//   e是操作目标节点的信息，目标数据的Id
//   console.log(e, id)
// }
// var config = {
//   boxId: 'college_box', // 容器id
//   list: data, // 数据源
//   showField: 'name', // 显示字段的Key
//   idField: 'id', // id字段
//   childListField: 'childCollegeList', // 子列表的Key字段
//   labelField: '学院选择:', // label字段
//   cb: callback, // 点击选项的回调
//   placeholder: '请选择学院', // placeholder字段
//   borderRadius: '20px', // 边框圆角
//   width: '300px', // 宽度
//   height: '40px', // 高度
//   borderColor: '#f2f3f5', // 边框颜色
// }
// var aaa = new SiteSelect(config)

var SiteSelect = function(configParams) {
  this.boxId = configParams.boxId
  this.list = configParams.list
  this.showField = configParams.showField
  this.idField = configParams.idField
  this.childListField = configParams.childListField
  this.labelField = configParams.labelField
  this.placeholder = configParams.placeholder || '请选择'
  this.borderRadius = configParams.borderRadius || '25px'
  this.width = configParams.width || '100%'
  this.height = configParams.height || '50px'
  this.borderColor = configParams.borderColor || '#f2f3f5'
  this.callBack = configParams.cb
  this.update = this.update
  this.createDOM()
  this.bindEvents()
  this.queryLiEvent()
}

SiteSelect.prototype.update = function () {
  this.createDOM()
  this.bindEvents()
  this.queryLiEvent()
}

// 创建DOM

SiteSelect.prototype.createDOM = function () {
  var boxId = "'" + this.boxId + "'"
  var listDoms =
    '<span class="select-label" style="line-height:' +
    this.height +
    '">' +
    this.labelField +
    '</span>' +
    '<div class="select-list" style="width: ' +
    this.width +
    '; height: ' +
    this.height +
    '; border-color: ' +
    this.borderColor +
    '; position: relative;">' +
    '<div class="select-down-up select-down" style="width: ' +
    this.height +
    '; height: ' +
    this.height +
    ';" onclick="SiteSelect.downUpEvent(event, ' +
    boxId +
    ')"></div>' +
    '<input type="text" readonly="true" style="border-radius:' +
    this.borderRadius +
    '" onfocus="SiteSelect.focusInput(event, ' +
    boxId +
    ')" class="select_list_filter" placeholder="' +
    this.placeholder +
    '" />' +
    '<ul class="select-list-box">' +
    this.liDoms(this.list) +
    '</ul>' +
    '</div>'
  $('#' + this.boxId).html('')
  $('#' + this.boxId).append(listDoms)
}

// 递归创建下拉框的dom节点

SiteSelect.prototype.liDoms = function (list) {
  var self = this
  var liDomsList = ''
  function renderItem(item, prefix) {
    var itemId = item[self.idField]
    var itemName = item[self.showField]
    if (!itemId || !itemName) {
      return
    }
    liDomsList += '<li class="select-list-item" id="' + itemId + '" title="' + itemName + '">' + prefix + '' + itemName + '</li>'
    // if (item.hasChild && Array.isArray(item[self.childListField])) {
    //   item[self.childListField].forEach(function (child) {
    //     return renderItem(child, prefix + '--')
    //   })
    // }
  }

  for (var i = 0; i < list.length; i++) {
    renderItem(list[i], '')
  }

  if (!list.length) {
    liDomsList += '<li class="select-list-item">暂无数据</li>'
  }

  return liDomsList
}

// 给下拉框绑定点击事件

SiteSelect.prototype.queryLiEvent = function () {
  var that = this
  var targetDom = $('#' + that.boxId).find('.select-list-box')[0]
  targetDom.addEventListener('click', function (e) {
    if (e.target == targetDom && targetDom.contains(e.target)) return
    var itemName = e.target.title
    var itemid = e.target.id
    $('#' + that.boxId)
      .find('.select_list_filter')
      .val(itemName)
    $('#' + that.boxId).find('.select-list-box')[0].style.height = '0px'
    $('#' + that.boxId)
      .find('.select-down-up')[0]
      .classList.remove('select-up')
    $('#' + that.boxId)
      .find('.select-down-up')[0]
      .classList.add('select-down')
    that.callBack && that.callBack(e, itemid)
  })
}

// 点击下拉框以外的区域，下拉框关闭

SiteSelect.prototype.bindEvents = function () {
  var self = this
  document.addEventListener('click', function (e) {
    var dropdown = $('#' + self.boxId).find('.select-list-box')[0]
    var dropdown1 = $('#' + self.boxId)[0]
    var selectDom = $('#' + self.boxId).find('.select-down-up')[0]
    if (e.target !== dropdown && !dropdown.contains(e.target) && e.target !== dropdown1 && !dropdown1.contains(e.target)) {
      dropdown.style.height = '0px'
      selectDom.classList.remove('selec-up')
      selectDom.classList.add('select-down')
    }
  })
}

// 下拉框展示收起的事件
SiteSelect.downUpEvent = function (e, boxId) {
  var selectBtnDom = $('#' + boxId).find('.select-list-box')[0];
  if (e.target.className.indexOf('select-up') > -1) {
    e.target.className = e.target.className.replace(/(?:^|\s)select-up(?!\S)/g, '') + ' select-down';
    $('#' + boxId).find('.select-list-box')[0].style.height = 'auto';
  } else if (e.target.className.indexOf('select-down') > -1) {
    e.target.className = e.target.className.replace(/(?:^|\s)select-down(?!\S)/g, '') + ' select-up';
    selectBtnDom.style.height = '0px';
  }
}

// input框获取焦点的事件
SiteSelect.focusInput = function (e, boxId) {
  var selectDownDom = $('#' + boxId).find('.select-down-up')[0];
  if (selectDownDom.className.indexOf('select-down') > -1) {
    selectDownDom.className = selectDownDom.className.replace(/(?:^|\s)select-down(?!\S)/g, '') + ' select-up';
    $('#' + boxId).find('.select-list-box')[0].style.height = 'auto';
  }
}

// 防抖函数
SiteSelect.prototype.debounceEve = function (func, delay) {
  var timeoutId
  return function () {
    var context = this
    var args = arguments
    clearTimeout(timeoutId)
    timeoutId = setTimeout(function () {
      func.apply(context, args)
    }, delay)
  }
}

// 过滤下拉列表--只是隐藏显示控制，不改变数据
SiteSelect.prototype.filterMethod = function (e, boxId) {
  var inputVal = e.target.value
  var listItems = $('#' + boxId).find('.select-list-item')
  listItems.each(function (_, item) {
    var isVisible = inputVal ? item.innerText.indexOf(inputVal) > -1 : true
    $(item).toggle(isVisible)
  })
}

SiteSelect.filterList = function (e, boxId) {
  var debouncedAction = this.prototype.debounceEve(this.prototype.filterMethod, 500)
  debouncedAction(e, boxId)
}

