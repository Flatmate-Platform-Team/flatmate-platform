import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppFrame, Eyebrow, PreviewTag, palette, ui } from "../components/app-ui";

const questions = [
  { title: "How do you like shared spaces to feel?", options: ["Tidy and reset each day", "Comfortable, with a weekly clean", "Relaxed, as long as it’s respectful"] },
  { title: "What’s your usual sleep rhythm?", options: ["Early nights, early starts", "Late nights suit me", "It changes through the week"] },
  { title: "How do you feel about guests?", options: ["A heads-up works best", "Friends are welcome often", "Mostly quiet at home"] },
  { title: "What does food at home look like?", options: ["I cook most days", "A mix of cooking and ordering", "Mostly my own routine"] },
  { title: "Your ideal noise level?", options: ["Quiet and calm", "Some music and conversation", "I use headphones when needed"] },
  { title: "How much personal space do you need?", options: ["A lot of solo time", "A good balance", "I enjoy shared time"] },
];

export default function Personality() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [complete, setComplete] = useState(false);
  const progress = Object.keys(answers).length;
  function answer(question: number, option: number) { setAnswers((current) => ({ ...current, [question]: option })); setComplete(false); }
  const result = Object.values(answers).length ? ["Considerate organiser", "Easygoing connector", "Thoughtful balancer"][Math.round(Object.values(answers).reduce((sum, item) => sum + item, 0) / Object.values(answers).length)] : "Thoughtful balancer";

  return (
    <AppFrame active="Profile">
      <View style={styles.heading}><Eyebrow>PERSONALITY COMPATIBILITY</Eyebrow><Text style={ui.heading}>{complete ? "Your home style" : "What feels like home to you?"}</Text><Text style={ui.subheading}>{complete ? "A starting point for better roommate conversations." : "A few quick questions about the rhythms of shared living."}</Text></View>
      <PreviewTag>LOCAL PREVIEW · ANSWERS ARE NOT SAVED</PreviewTag>
      {!complete ? <>
        <View style={styles.progressHead}><Text style={styles.progressLabel}>YOUR PROGRESS</Text><Text style={styles.progressCount}>{progress} / {questions.length}</Text></View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress / questions.length * 100}%` }]} /></View>
        {questions.map((question, questionIndex) => <View key={question.title} style={styles.questionCard}><Text style={styles.questionNo}>QUESTION {String(questionIndex + 1).padStart(2, "0")}</Text><Text style={styles.question}>{question.title}</Text><View style={styles.options}>{question.options.map((option, optionIndex) => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: answers[questionIndex] === optionIndex }} onPress={() => answer(questionIndex, optionIndex)} style={[styles.option, answers[questionIndex] === optionIndex && styles.optionSelected]}><View style={[styles.radio, answers[questionIndex] === optionIndex && styles.radioSelected]} /><Text style={[styles.optionText, answers[questionIndex] === optionIndex && styles.optionTextSelected]}>{option}</Text></Pressable>)}</View></View>)}
        <Pressable accessibilityRole="button" disabled={progress !== questions.length} onPress={() => setComplete(true)} style={[styles.finishButton, progress !== questions.length && styles.disabled]}><Text style={styles.finishText}>See my result  →</Text></Pressable>
      </> : <View style={styles.resultCard}><View style={styles.resultIcon}><Text style={styles.resultIconText}>✦</Text></View><Text style={styles.resultEyebrow}>YOUR SAMPLE RESULT</Text><Text style={styles.resultTitle}>{result}</Text><Text style={styles.resultCopy}>You value a home where people communicate clearly and respect each other’s routines. Use this as a conversation starter, not a compatibility verdict.</Text><Pressable accessibilityRole="button" onPress={() => setComplete(false)} style={styles.retake}><Text style={styles.retakeText}>Review my answers</Text></Pressable></View>}
      <Text style={styles.disclaimer}>This questionnaire is a prototype. Answers stay on this screen and are not used to rank people.</Text>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 5 }, progressHead: { flexDirection: "row", justifyContent: "space-between" }, progressLabel: { color: palette.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, progressCount: { color: palette.yellow, fontSize: 10, fontWeight: "900" }, progressTrack: { height: 7, overflow: "hidden", borderRadius: 4, backgroundColor: "#303034" }, progressFill: { height: 7, borderRadius: 4, backgroundColor: palette.blueLight }, questionCard: { gap: 12, padding: 16, borderWidth: 1, borderColor: palette.line, borderRadius: 20, backgroundColor: palette.card }, questionNo: { color: palette.blueLight, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 }, question: { color: palette.white, fontSize: 16, lineHeight: 21, fontWeight: "800" }, options: { gap: 8 }, option: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 11, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 13, backgroundColor: "#101011" }, optionSelected: { borderColor: palette.blueLight, backgroundColor: "rgba(48,79,254,0.16)" }, radio: { width: 16, height: 16, borderWidth: 1, borderColor: "#71717A", borderRadius: 9 }, radioSelected: { borderWidth: 5, borderColor: palette.blueLight }, optionText: { flex: 1, color: "#D4D4D8", fontSize: 11, lineHeight: 16 }, optionTextSelected: { color: palette.white, fontWeight: "700" }, finishButton: { minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: palette.blue }, finishText: { color: palette.white, fontSize: 13, fontWeight: "900" }, disabled: { opacity: 0.42 }, resultCard: { alignItems: "center", padding: 24, borderWidth: 1, borderColor: "rgba(82,109,255,0.35)", borderRadius: 23, backgroundColor: "#15182A" }, resultIcon: { width: 70, height: 70, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: palette.blue }, resultIconText: { color: palette.white, fontSize: 30 }, resultEyebrow: { marginTop: 18, color: palette.yellow, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 }, resultTitle: { marginTop: 8, color: palette.white, fontSize: 23, fontWeight: "900", textAlign: "center" }, resultCopy: { marginTop: 10, color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: "center" }, retake: { marginTop: 20, padding: 12 }, retakeText: { color: palette.blueLight, fontSize: 12, fontWeight: "800" }, disclaimer: { color: "#85858D", fontSize: 9, lineHeight: 14, textAlign: "center" },
});
