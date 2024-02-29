//jquery的核心思想：选择器 选中元素 绑定事件
$(function(){

    //创建音频播放器对象(并包装为jquery对象)
    const player = $('<audio>')
    //服务端歌曲列表接口地址
    const musicListAPI = 'http://home.softeem.xin:8088/music/listAll'
    //初始化歌曲数组
    let musics = []
    //初始化当前播放的歌曲索引
    let currentIndex = 0
    //初始化歌曲的当前播放位置和总时长(单位:秒)
    let now = 0
    let total = 0
    //标记当前播放器播放状态：true-正在播放 false-暂停播放
    let playing = false

    //选中指定类名的元素并绑定点击事件
    $('.btn-list').on('click',function(){
        //显示歌曲列表
        $('#music-list-dialog').fadeIn(1000)
    })

    $('#btn-close').click(function(){
        $('#music-list-dialog').fadeOut(1000)
    })

    //ajax技术（异步请求）
    $.get(musicListAPI,function(data){
         //将从服务端获取的数组缓存到变量中
         musics = data
         //循环遍历数组
         $.each(musics,(i,e)=>{
            $('#music-list').append(`<li data-index="${i}">${e.name}</li>`)
         }) 
    })

    //为歌曲列表项绑定点击事件，实现歌曲播放
    //事件委派（委托）
    $('#music-list').on('click','li',function(){
        //当前索引更改前，移除上一首歌曲列表项的激活状态
        $(`li:eq(${currentIndex})`).removeClass('active')
        //获取li元素上的data-index属性
        currentIndex = $(this).data('index')
        //获取需要播放的歌曲对象
        let m = musics[currentIndex] 
        //为播放器设置播放源
        player.prop('src',m.path)
        //开始播放
        startPlay(m)
    })    
    
    //封装一个公共函数,实现歌曲播放信息状态同步显示
    function startPlay(){
        //标记当前播放器处于播放状态
        playing = true
        //主动触发play函数
        player.trigger('play')
        //1.实现唱片旋转 
        $('.cover').addClass('playing')
        //2.在头部显示歌曲名称
        $('.music-name').text(musics[currentIndex].name)    
        //3.播放按钮切换为暂停
        $('.btn-play-pause > i').removeClass('fa-play').addClass('fa-pause')
        //4.列表中正在播放的歌曲高亮展示
        $(`li:eq(${currentIndex})`).addClass('active')
        //5.同步显示唱片封面图和背景毛玻璃图片
        $('.cover-img,.body-bg').prop('src',musics[currentIndex].ablumImg)
    }
 
    //扩展（查看Audio-api）
    //1. 同步动态显示播放时长和当前进度
    //2. 进度条同步显示

    //监听播放器的媒体第一帧加载事件
    player.on('loadeddata',function(){
        //获取当前播放器表示的播放源的总播放时长
        total = this.duration
        //00:00
        $('.time-total').text(fmtTime(total)) 
    })

    //监听播放器的当前播放时间变化
    player.on('timeupdate',function(){
        //获取当前播放进度
        now = this.currentTime
        //将进度格式化为目标时间格式填充到对应的元素中
        $('.time-now').text(fmtTime(now))
        //实时同步进度显示
        $('.progress').css('width',`${now/total*100}%`) 
    }) 

    //mm:ss
    function fmtTime(t){
        //基于提供的时间构建日期对象
        t = new Date(t * 1000)
        //获取日期对象中的分钟值
        let m = t.getMinutes()
        //获取日期对象中的秒钟值
        let s = t.getSeconds();
        //将时间格式化为两位数
        m = m < 10 ? '0' + m : m
        s = s < 10 ? '0' + s : s
        return `${m}:${s}`;
    } 

    //为进度条父容器设置点击事件
    $('.progress-touch').on('click',function(e){
        //获取当前点击位置和左侧偏移值
        let offset = e.offsetX
        //当前进入条容器总宽度
        let width = $(this).width()
        //计算获取当前播放器需要跳转到的位置
        now = offset / width * total
        //设置播放器的当前位置
        player.prop('currentTime',now)
    })

    //播放和暂停实现
    $('.btn-play-pause').on('click',function(){
        if(playing){
            //暂停
            player.trigger('pause')
            //唱片停止旋转
            $('.cover').removeClass('playing')
            //按钮图标切换为播放
            $('.btn-play-pause > i').removeClass('fa-pause').addClass('fa-play')
            //标记暂停
            playing = false
        }else{
            //继续播放
            startPlay()
        }
    })

    // 任务
    // 1. 点击按钮实现循环图标切换（0-列表，1-随机，2-单曲）
    // 2. 根据循环状态实现上一曲和下一曲切歌
    // 3. 歌曲播放完毕之后，自动切歌（参考循环方式）
})

    
