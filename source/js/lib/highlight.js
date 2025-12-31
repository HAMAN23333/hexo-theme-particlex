mixins.highlight = {
    data() {
        return { copying: false };
    },
    created() {
        // 【修复 1】禁止忽略未转义 HTML（使用默认安全行为）
        hljs.configure({ ignoreUnescapedHTML: false });

        this.renderers.push(this.highlight);
    },
    methods: {
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        highlight() {
            let codes = document.querySelectorAll("pre");

            for (let i of codes) {
                // 【修复 2】确保读取的是纯文本（你这一步本来就是对的）
                let code = i.textContent;

                let language =
                    (i.firstChild && [...i.firstChild.classList].find(c => c.startsWith("language-"))?.replace("language-", ""))
                    || [...i.classList][0]
                    || "plaintext";

                let highlighted;
                try {
                    highlighted = hljs.highlight(code, { language }).value;
                } catch {
                    // 【修复 3】fallback 也必须是“安全文本”
                    highlighted = hljs.highlightAuto(code).value;
                }

                i.innerHTML = `
                    <div class="code-content hljs">${highlighted}</div>
                    <div class="language">${language}</div>
                    <div class="copycode">
                        <i class="fa-solid fa-copy fa-fw"></i>
                        <i class="fa-solid fa-check fa-fw"></i>
                    </div>
                `;

                let content = i.querySelector(".code-content");
                hljs.lineNumbersBlock(content, { singleLine: true });

                let copycode = i.querySelector(".copycode");
                copycode.addEventListener("click", async () => {
                    if (this.copying) return;
                    this.copying = true;
                    copycode.classList.add("copied");
                    await navigator.clipboard.writeText(code);
                    await this.sleep(1000);
                    copycode.classList.remove("copied");
                    this.copying = false;
                });
            }
        },
    },
};
