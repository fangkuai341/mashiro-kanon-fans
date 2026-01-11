<template>
  <div style="position: relative;width: 100%; height: 100%;">
    <div ref="chartContainer" style="width: 100%; height: 100%;"></div>
    <button
      v-if="showResetButton"
      @click="handleReset"
      class="reset-btn"
    >
      Reset
    </button>
  </div>
</template>

<script lang="ts">
import * as echarts from 'echarts';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { getBilibiliStatsApi } from '../api';

export default {
  setup() {
    const chartContainer = ref<HTMLElement | null>(null);
    const showResetButton = ref(false);
    let myChart: echarts.ECharts | null = null;

    const GRID_TOP = 40;
    const GRID_BOTTOM = 20;
    const GRID_LEFT = 10;
    const GRID_RIGHT = 10;
    const Y_DATA_ROUND_PRECISION = 0;

    const _breakAreaStyle = {
      expandOnClick: false,
      zigzagZ: 200,
      zigzagAmplitude: 0,
      itemStyle: {
        borderColor: '#777',
        opacity: 0
      }
    };

    const option = ref({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {},
      grid: {
        top: GRID_TOP,
        bottom: GRID_BOTTOM,
        left: GRID_LEFT,
        right: GRID_RIGHT
      },
      xAxis: [
        {
          type: 'time',
          splitLine: { show: false },
          breakArea: _breakAreaStyle
        }
      ],
      yAxis: [
        {
          axisTick: {
            show: true
          },
          breakArea: _breakAreaStyle
        }
      ],
      series: [
        {
          type: 'line',
          symbol: 'circle',
          showSymbol: false,
          symbolSize: 5,
          data: []
        }
      ]
    });

    /**
     * This is some interaction logic with axis break:
     *  - Brush to fisheye-magnify an area.
     *
     * You can ignore this part if you do not need it.
     */
    function initAxisBreakInteraction() {
      if (!myChart) return;

      let _brushingEl: echarts.graphic.Rect | null = null;

      myChart.getZr().on('mousedown', function (params: any) {
        _brushingEl = new echarts.graphic.Rect({
          shape: {
            x: params.offsetX,
            y: params.offsetY,
            width: 0,
            height: 0
          },
          style: {
            stroke: '#1890ff',
            fill: 'rgba(24, 144, 255, 0.1)',
            lineWidth: 2
          }
        });
        myChart?.getZr().add(_brushingEl);
      });

      myChart.getZr().on('mousemove', function (params: any) {
        if (!_brushingEl) {
          return;
        }
        const initX = _brushingEl.shape.x;
        const initY = _brushingEl.shape.y;
        _brushingEl.setShape({
          width: params.offsetX - initX,
          height: params.offsetY - initY
        });
      });

      const handleMouseUp = function (params: any) {
        if (!_brushingEl || !myChart) {
          return;
        }
        const initX = _brushingEl.shape.x;
        const initY = _brushingEl.shape.y;
        const currPoint = [params.clientX, params.clientY];
        const xPixelSpan = Math.abs(currPoint[0] - initX);
        const yPixelSpan = Math.abs(currPoint[1] - initY);

        if (xPixelSpan > 10 && yPixelSpan > 10) {
          const pointOnCanvas = [
            params.clientX - (chartContainer.value?.getBoundingClientRect().left || 0),
            params.clientY - (chartContainer.value?.getBoundingClientRect().top || 0)
          ];

          updateAxisBreak(
            myChart,
            [initX, initY],
            pointOnCanvas,
            xPixelSpan,
            yPixelSpan
          );
        }

        myChart.getZr().remove(_brushingEl);
        _brushingEl = null;
      };

      document.addEventListener('mouseup', handleMouseUp);

      function updateAxisBreak(
        myChart: echarts.ECharts,
        initXY: number[],
        currPoint: number[],
        xPixelSpan: number,
        yPixelSpan: number
      ) {
        const dataXY0 = myChart.convertFromPixel({ gridIndex: 0 }, initXY);
        const dataXY1 = myChart.convertFromPixel({ gridIndex: 0 }, currPoint);

        function makeDataRange(v0: number, v1: number) {
          const dataRange = [roundXYValue(v0), roundXYValue(v1)];
          if (dataRange[0] > dataRange[1]) {
            dataRange.reverse();
          }
          return dataRange;
        }

        const xDataRange = makeDataRange(dataXY0[0], dataXY1[0]);
        const yDataRange = makeDataRange(dataXY0[1], dataXY1[1]);

        const xySpan = getXYAxisPixelSpan(myChart);
        const xGapPercentStr = ((xPixelSpan / xySpan[0]) * 100) + '%';
        const yGapPercentStr = ((yPixelSpan / xySpan[1]) * 100) + '%';

        function makeOption(xGapPercentStr: string, yGapPercentStr: string) {
          const optionUpdate = {
            xAxis: {
              breaks: [
                {
                  start: xDataRange[0],
                  end: xDataRange[1],
                  gap: xGapPercentStr
                }
              ]
            },
            yAxis: {
              breaks: [
                {
                  start: yDataRange[0],
                  end: yDataRange[1],
                  gap: yGapPercentStr
                }
              ]
            }
          };
          return optionUpdate;
        }

        // Create axis break on the brushed area
        myChart.setOption(makeOption(xGapPercentStr, yGapPercentStr));

        setTimeout(() => {
          const optionUpdate = makeOption('80%', '80%');
          myChart?.setOption(optionUpdate);
          showResetButton.value = true;
        }, 100);
      }

      function getXYAxisPixelSpan(myChart: echarts.ECharts) {
        return [
          myChart.getWidth() - GRID_LEFT - GRID_RIGHT,
          myChart.getHeight() - GRID_BOTTOM - GRID_TOP
        ];
      }

      // Return cleanup function
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }

    function roundXYValue(val: number) {
      return parseFloat(val.toFixed(Y_DATA_ROUND_PRECISION));
    }

    function handleReset() {
      if (myChart) {
        const optionUpdate = {
          xAxis: { breaks: [] },
          yAxis: { breaks: [] }
        };
        myChart.setOption(optionUpdate);
        showResetButton.value = false;
      }
    }

    async function generateSeriesData() {
      const res=await getBilibiliStatsApi()
      const seriesData= res.map((item)=>{
        return [new Date(item.record_time).getTime(), item.follower]
      })
console.log(seriesData);

      return seriesData;
    }

    // 初始化图表
    onMounted(async () => {
      nextTick(async () => {
        if (chartContainer.value) {
          myChart = echarts.init(chartContainer.value);
          myChart.setOption(option.value);

          // 加载数据并更新图表
          const seriesData = await generateSeriesData();
          if (myChart) {
            myChart.setOption({
              series: [{
                data: seriesData
              }]
            });
          }

          // 初始化交互
          setTimeout(() => {
            initAxisBreakInteraction();
          }, 100);

          // 窗口大小变化时重绘图表
          const handleResize = () => {
            myChart?.resize();
          };
          window.addEventListener('resize', handleResize);

          // 清理函数
          onUnmounted(() => {
            window.removeEventListener('resize', handleResize);
            myChart?.dispose();
          });
        }
      });
    });

    // 监听option变化
    watch(option, (newOption) => {
      if (myChart) {
        myChart.setOption(newOption);
      }
    }, { deep: true });

    return {
      chartContainer,
      showResetButton,
      handleReset
    };
  }
};
</script>

<style scoped>
.reset-btn {
  position: absolute;
  left: 80%;
  top: -40px;
  width: 70px;
  height: 30px;
  background-color: #eee;
  border: 1px solid #999;
  border-radius: 3px;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #ddd;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
}

.reset-btn:active {
  background-color: #ccc;
  transform: scale(0.98);
}
</style>