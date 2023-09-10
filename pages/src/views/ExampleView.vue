<script setup lang="ts">
import { ref } from 'vue';
import ExampleGroup from './ExampleGroup.vue'
import Context from 'hammerhead.gl/core/Context';

interface Group { key: string, items: string[] };

const groups = ref<Group[]>([]);

fetch('/examples.json').then(async res => {
    const json = await res.json();
    const gps = [];
    for (const key of Object.keys(json)) {
        gps.push({ key, items: json[key] as string[] });
    }
    groups.value = gps;
});

const context = Context
</script>

<template>
    <div>
        <div class="example-list">
            <div class="accordion p-2" id="accordionExample">
                <ExampleGroup v-for="item in groups" :key="item.key" :title="item.key" :items="item.items" />
            </div>
        </div>
        <div class="view">
            <canvas id="canvas"></canvas>
            <div class="attributions">
                <p>Hammerhead model courtesy of <a href="https://people.sc.fsu.edu/~jburkardt/data/ply/ply.html" target="_blank">John Burkardt</a></p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.example-list {
    width: 20rem !important;
    position: absolute;
    left: 0;
    z-index: 1;
}

.view {
    width: 100% !important;
    background-color: red;
    position: absolute;
    left: 20rem;
}
</style>