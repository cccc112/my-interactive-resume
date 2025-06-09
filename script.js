// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    
    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Radar Chart
    const ctx = document.getElementById('skillsRadarChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['程式語言', '資料分析', '機器學習', '影像處理', '專案實作', '協作能力'],
            datasets: [{
                label: '綜合能力評估',
                data: [85, 90, 80, 75, 90, 85],
                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                borderColor: 'rgb(13, 148, 136)',
                pointBackgroundColor: 'rgb(13, 148, 136)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(13, 148, 136)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#44403c' // stone-700
                    },
                     ticks: {
                        backdropColor: 'transparent',
                        color: '#a8a29e' // stone-400
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                     labels: {
                        color: '#44403c' // stone-700
                    }
                }
            }
        }
    });

    // Project Card Expansion
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const clickableArea = card.querySelector('.cursor-pointer');
        const details = card.querySelector('.project-details');
        const icon = card.querySelector('.expand-icon');

        clickableArea.addEventListener('click', () => {
            if (details.style.maxHeight) {
                details.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                details.style.maxHeight = details.scrollHeight + "px";
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // LLM Integration
    const optimizeResumeButton = document.getElementById('optimizeResumeButton');
    const generateInterviewQuestionsButton = document.getElementById('generateInterviewQuestionsButton');
    const llmResponseModal = document.getElementById('llmResponseModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const modalTitle = document.getElementById('modalTitle');
    const modalContentText = document.getElementById('modalContentText');
    const modalLoading = document.querySelector('.modal-loading');

    const showModal = (title, content) => {
        modalTitle.textContent = title;
        modalContentText.textContent = content;
        modalLoading.classList.add('hidden');
        llmResponseModal.classList.add('show');
    };

    const showLoadingModal = (title) => {
        modalTitle.textContent = title;
        modalContentText.textContent = '';
        modalLoading.classList.remove('hidden');
        llmResponseModal.classList.add('show');
    };

    const hideModal = () => {
        llmResponseModal.classList.remove('show');
        modalTitle.textContent = '';
        modalContentText.textContent = '';
    };

    closeModalButton.addEventListener('click', hideModal);
    llmResponseModal.addEventListener('click', (e) => {
        if (e.target === llmResponseModal) { // Close when clicking outside the content
            hideModal();
        }
    });

    const getResumeContent = () => {
        let content = '';
        // Hero Section
        content += `姓名: ${document.querySelector('#hero h1').textContent}\n`;
        content += `職稱: ${document.querySelector('#hero p').textContent}\n`;
        content += `求職目標: ${document.querySelector('#hero p.leading-relaxed').textContent}\n\n`;

        // About Section - Personal Intro
        content += `個人簡介:\n${document.querySelector('#about .md\\:col-span-3 p').textContent}\n\n`;

        // About Section - Personal Traits
        content += `個人特質:\n`;
        document.querySelectorAll('#about .md\\:col-span-2 li span').forEach(item => {
            content += `- ${item.textContent}\n`;
        });
        content += `\n`;

        // Skills Section
        content += `核心技能:\n`;
        document.querySelectorAll('#skills .skill-tag').forEach(tag => {
            content += `${tag.textContent}, `;
        });
        content = content.slice(0, -2) + '\n\n'; // Remove trailing comma and space

        // Projects Section
        content += `專案經驗:\n`;
        document.querySelectorAll('.project-card').forEach(card => {
            const title = card.querySelector('h3').textContent;
            const type = card.querySelector('p.text-sm').textContent;
            const description = card.querySelector('p.mt-4.text-stone-600').textContent;
            let techDetails = '';
            card.querySelectorAll('.project-details li').forEach(li => {
                techDetails += `- ${li.textContent}\n`;
            });
            const results = card.querySelector('.project-details h4:last-of-type + p').textContent;
            content += `項目: ${title} (${type})\n`;
            content += `簡述: ${description}\n`;
            if (techDetails) {
                content += `技術實作:\n${techDetails}`;
            }
            content += `成果: ${results}\n\n`;
        });

        // Experience & Education
        content += `工作與學歷:\n`;
        document.querySelectorAll('.timeline-item').forEach(item => {
            const date = item.querySelector('p.font-semibold').textContent;
            const title = item.querySelector('h3').textContent;
            const companyOrSchool = item.querySelector('p.text-md').textContent;
            let details = '';
            if (item.querySelector('p.text-sm')) {
                details = item.querySelector('p.text-sm').textContent;
            } else if (item.querySelector('ul')) {
                item.querySelectorAll('ul li').forEach(li => {
                    details += `- ${li.textContent}\n`;
                });
            }
            content += `${date} - ${title}, ${companyOrSchool}\n`;
            if (details) {
                content += `${details}\n`;
            }
            content += `\n`;
        });

        return content;
    };

    const callGeminiAPI = async (prompt) => {
        const chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                return '未能從 AI 獲取有效回應，請稍後再試。';
            }
        } catch (e) {
            console.error("Error calling Gemini API:", e);
            return `呼叫 AI 失敗：${e.message}，請檢查網路連線。`;
        }
    };

    optimizeResumeButton.addEventListener('click', async () => {
        showLoadingModal('履歷優化建議');
        const resumeContent = getResumeContent();
        const prompt = `請根據以下履歷內容，提供針對數據分析師、AI 實習生或韌體/軟體測試工程師職位的優化建議。請著重於內容的精確性、亮點呈現、以及與職位相關的關鍵詞運用。請以繁體中文條列式說明。\n\n履歷內容：\n${resumeContent}`;
        const response = await callGeminiAPI(prompt);
        showModal('履歷優化建議', response);
    });

    generateInterviewQuestionsButton.addEventListener('click', async () => {
        showLoadingModal('面試問題模擬');
        const resumeContent = getResumeContent();
        const prompt = `請根據以下履歷內容，為應徵數據分析師或AI相關職位生成5個常見的面試問題，以及5個針對履歷中特定經驗（例如手部辨識專案或Kaggle競賽）的行為面試問題。請以繁體中文條列式說明，問題應具體且能引導候選人闡述其經驗和能力。\n\n履歷內容：\n${resumeContent}`;
        const response = await callGeminiAPI(prompt);
        showModal('面試問題模擬', response);
    });
});
