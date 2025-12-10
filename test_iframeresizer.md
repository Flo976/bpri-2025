document.addEventListener("DOMContentLoaded", () => {
                (function () {
                    // 1. Polyfill requestAnimationFrame
                    window.requestAnimationFrame =
                        window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        function (cb) {
                            return setTimeout(cb, 16);
                        };

                    // 2. Exécuter au plus tôt après DOMContentLoaded, même si readyState est déjà "interactive"/"complete"
                    function onReady(fn) {
                        if (
                            document.readyState === "complete" ||
                            document.readyState === "interactive"
                        ) {
                            setTimeout(fn, 0);
                        } else {
                            document.addEventListener("DOMContentLoaded", fn);
                        }
                    }

                    onReady(function () {
                        // 3. Sélection des sections (<div class="section">…</div>)
                        var sections = document.querySelectorAll(".section");
                        // 4. Tableau pour mémoriser celles déjà animées
                        var animated = [];

                        function hasAnimated(sec) {
                            return animated.indexOf(sec) !== -1;
                        }

                        function markAnimated(sec) {
                            animated.push(sec);
                            sec.dispatchEvent(new CustomEvent("becameVisible"));
                        }

                        // 5. Calcul de visibilité
                        function checkVisibility(props) {
                            var scrollTop = props.scrollTop || 0;
                            var offsetTop = props.offsetTop || 0;
                            // props.windowHeight existe parfois, sinon fallback sur clientHeight ou innerHeight
                            var windowH =
                                props.windowHeight ||
                                props.clientHeight ||
                                window.innerHeight;

                            for (var i = 0; i < sections.length; i++) {
                                var sec = sections[i];
                                if (hasAnimated(sec)) {
                                    continue;
                                }
                                var rect = sec.getBoundingClientRect();
                                // calcul depuis le parent (iframe) : on soustrait scrollTop
                                var topInParent =
                                    offsetTop + rect.top - scrollTop;
                                var threshold = windowH * 0.75;
                                if (topInParent < threshold) {
                                    // Ajout de la classe "animated"
                                    if (sec.classList) {
                                        sec.classList.add("animated");
                                    } else {
                                        // IE9 fallback
                                        sec.className += " animated";
                                    }
                                    markAnimated(sec);
                                }
                            }
                        }

                        // 6. Boucle d’animation
                        function startLoop(getProps) {
                            function tick() {
                                getProps(checkVisibility);
                                requestAnimationFrame(tick);
                            }
                            tick();
                        }

                        // 7. Attendre que parentIFrame (iframe-resizer) soit prêt
                        function initWhenReady() {
                            if (window.parentIFrame) {
                                // v3.x : getPageInfo(cb), v4.x : getParentProps(cb)
                                var getProps =
                                    parentIFrame.getPageInfo ||
                                    parentIFrame.getParentProps;
                                startLoop(getProps);
                            } else {
                                setTimeout(initWhenReady, 100);
                            }
                        }

                        initWhenReady();
                    });
                })();
            });