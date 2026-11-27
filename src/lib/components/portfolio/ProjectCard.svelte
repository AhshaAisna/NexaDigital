<script>
  import Icon from "../../../components/Icon.svelte";

  export let project;
  export let onViewCaseStudy = () => {};
</script>

<div
  class="bg-white p-6 flex flex-col justify-between h-full group transition-all duration-200 rounded-[36px] border border-[#ececee]"
>
  <div>
    <!-- Gambar Thumbnail -->
    <div
      class="h-48 overflow-hidden bg-[#fafafa] border border-[#ececee] relative rounded-[24px]"
    >
      <img
        src={project.thumbnail}
        alt={project.title}
        class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        loading="lazy"
      />
      <!-- Tag Kategori -->
      <span
        class="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-[#09090b] text-white px-2.5 py-1 rounded-[12px]"
      >
        {project.categoryLabel}
      </span>
    </div>

    <!-- Konten Proyek -->
    <div class="pt-5 space-y-2.5">
      <!-- Judul -->
      <h3
        class="text-base sm:text-lg font-semibold text-[#09090b] group-hover:text-[#ff5a00] transition-colors duration-200 leading-snug"
      >
        {project.title}
      </h3>
      <p class="text-[13px] text-[#52525b] line-clamp-2 leading-relaxed">
        {project.summary}
      </p>

      <!-- Tag Teknologi -->
      {#if project.technologies && project.technologies.length > 0}
        <div class="flex flex-wrap gap-1.5 pt-1.5">
          {#each project.technologies.slice(0, 3) as tech}
            <span
              class="text-[11px] bg-[#fafafa] text-[#18181b] px-2.5 py-1 border border-[#ececee] rounded-[12px] font-medium"
            >
              {tech}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Aksi Buka Kasus -->
  <div class="pt-6 border-t border-[#ececee] mt-6">
    <button
      type="button"
      on:click={() => onViewCaseStudy(project)}
      class="w-full py-3 px-4 text-[13px] font-medium text-[#09090b] bg-[#fafafa] hover:bg-[#09090b] hover:text-white transition-all duration-200 border border-[#ececee] flex items-center justify-center gap-2 cursor-pointer rounded-[14px]"
    >
      <span>Buka Studi Kasus Lengkap</span>
      <Icon name="arrow-right" size={14} />
    </button>
  </div>
</div>