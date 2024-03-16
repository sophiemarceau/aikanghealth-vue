import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

//导入ElementPlus相关依赖库
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

//配置SVG依赖库（此处为新增）
import path from 'path';
import viteSvgIcons, { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        //配置按需自动加载ElementPlus控件
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        //引用ElementPlus控件库
        Components({
            resolvers: [ElementPlusResolver()]
        }),
        //引入SVG图标素材文件（此处为新增，留意上一行的逗号）
        createSvgIconsPlugin({
            iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
            symbolId: '[name]'
        })
    ],
    server: {
        host: "localhost",
        port: 7600,
        //允许跨域
        cors: true
    }
});
