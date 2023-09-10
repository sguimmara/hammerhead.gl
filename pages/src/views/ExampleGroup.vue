<script setup lang="ts">

const props = defineProps<{
    title: string;
    items: string[]
}>();

const id = `example-group-${props.title?.toLowerCase()}`;
</script>

<template>
    <div class="accordion-item">
        <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#${id}`"
                aria-expanded="true" :aria-controls="id">
                {{title}}
            </button>
        </h2>
        <div :id="id" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div class="accordion-body p-2">
                <ul class="list-group">
                    <li class="list-group-item" v-for="item in items" :key="item"><a href="#">{{ item }}</a></li>
                </ul>
            </div>
        </div>
    </div>
</template>