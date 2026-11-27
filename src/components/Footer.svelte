<script>
  import { companyInfo } from "../data/team";
  import { services } from "../data/services";
  import { navigateTo } from "../stores/marketplaceStore";
  import { isClientLoggedIn, isAdminLoggedIn, isPegawaiLoggedIn } from "../stores/authStore";
  import Icon from "./Icon.svelte";
</script>

<footer class="bg-[#0f172a] text-[#94a3b8] text-xs sm:text-sm border-t border-[#1e293b] font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
  <!-- Elemen Cahaya Dekoratif Latar Belakang -->
  <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff5a00]/15 rounded-full blur-[120px] pointer-events-none"></div>

  <div class="w-full px-6 sm:px-12 lg:px-20 py-16 relative z-10">
    
    <!-- Top Grid Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1e293b]">
      
      <!-- Brand & Description (Col 4) -->
      <div class="lg:col-span-4 space-y-4">
        <div class="flex items-center gap-3">
          <!-- <div class="w-10 h-10 bg-[#ff5a00] text-white rounded-xl flex items-center justify-center font-bold text-sm tracking-wider shadow-md shadow-[#ff5a00]/30">
            NX
          </div> -->
          <div>
            <span class="font-semibold text-base text-white tracking-tight block leading-none">
              Nexa Digital
            </span>
            <span class="text-[10px] text-[#64748b] font-medium tracking-widest uppercase block mt-1">
              {companyInfo.legalName}
            </span>
          </div>
        </div>
        
        <p class="text-[#94a3b8] text-[13px] leading-relaxed max-w-sm">
          {companyInfo.description}
        </p>

        <!-- System Status Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[11px] font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Semua Sistem Beroperasi Normal</span>
        </div>
      </div>

      <!-- Links: Layanan (Col 3) -->
      <div class="lg:col-span-3 space-y-3">
        <h4 class="font-semibold text-[11px] uppercase text-white tracking-wider">
          [ LAYANAN DIGITAL ]
        </h4>
        <ul class="space-y-2 text-[13px]">
          {#each services as item}
            <li>
              <button
                type="button"
                onclick={() => navigateTo("service-detail", { serviceId: item.id })}
                class="text-[#94a3b8] hover:text-[#ff5a00] transition-colors text-left cursor-pointer"
              >
                {item.name}
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Links: Perusahaan (Col 2) -->
      <div class="lg:col-span-2 space-y-3">
        <h4 class="font-semibold text-[11px] uppercase text-white tracking-wider">
          [ PERUSAHAAN ]
        </h4>
        <ul class="space-y-2 text-[13px]">
          <li>
            <button type="button" onclick={() => navigateTo("about")} class="text-[#94a3b8] hover:text-[#ff5a00] transition-colors cursor-pointer">
              Tentang Kami
            </button>
          </li>
          <li>
            <button type="button" onclick={() => navigateTo("portfolio")} class="text-[#94a3b8] hover:text-[#ff5a00] transition-colors cursor-pointer">
              Portofolio
            </button>
          </li>
          <li>
            <button type="button" onclick={() => navigateTo($isClientLoggedIn ? "customer-dashboard" : $isPegawaiLoggedIn ? "pegawai-dashboard" : $isAdminLoggedIn ? "admin-dashboard" : "login")} class="text-[#94a3b8] hover:text-[#ff5a00] transition-colors cursor-pointer">
              {$isClientLoggedIn ? 'Dashboard Klien' : $isPegawaiLoggedIn ? 'Dashboard Pegawai' : $isAdminLoggedIn ? 'Admin Console' : 'Masuk ke Akun'}
            </button>
          </li>
        </ul>
      </div>

      <!-- Contact Info (Col 3) -->
      <div class="lg:col-span-3 space-y-3">
        <h4 class="font-semibold text-[11px] uppercase text-white tracking-wider">
          [ KONTAK RESMI ]
        </h4>
        <div class="space-y-2.5 text-[13px] text-[#94a3b8]">
          <p class="flex items-start gap-2">
            <Icon name="map-pin" size={14} className="mt-0.5 text-[#ff5a00] shrink-0" />
            <span>{companyInfo.address}</span>
          </p>
          <p class="flex items-center gap-2">
            <Icon name="mail" size={14} className="text-[#ff5a00] shrink-0" />
            <a href="mailto:{companyInfo.email}" class="hover:text-[#ff5a00] transition-colors">{companyInfo.email}</a>
          </p>
          <p class="flex items-center gap-2">
            <Icon name="phone" size={14} className="text-[#ff5a00] shrink-0" />
            <a href="https://wa.me/6281289213344" target="_blank" rel="noreferrer" class="hover:text-[#ff5a00] transition-colors">{companyInfo.whatsapp}</a>
          </p>
        </div>
      </div>

    </div>

    <!-- Bottom Copyright & Quick Nav -->
    <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#64748b]">
      <p>
        © {new Date().getFullYear()} {companyInfo.legalName}. Hak cipta dilindungi undang-undang.
      </p>
      
      <div class="flex items-center gap-6">
        <button type="button" onclick={() => navigateTo('client-login')} class="hover:text-white transition-colors cursor-pointer">
          Login Klien
        </button>
        {#if !$isClientLoggedIn}
          <button type="button" onclick={() => navigateTo('admin-login')} class="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
            <Icon name="shield" size={12} />
            <span>Admin</span>
          </button>
        {/if}
        <span class="text-[#1e293b]">|</span>
        <span class="text-white font-medium">Terdaftar PPN Resmi</span>
      </div>
    </div>

  </div>
</footer>