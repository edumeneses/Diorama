import { Text, View } from '@/components/core'
import { Stack } from '@/components/core/stack'
import { WindowControls } from '@/components/core/window-control'

export default function AboutPage() {
  return (
    <>
      <Stack options={{ title: 'About' }} className="p-6" material>
        <View>
          <Text size="title2" className="mb-4">
            This is the about page
          </Text>
          <Text variant="secondary">
            Lorem ipsum dolor sit amet, eos an omnis insolens delicatissimi. Et vidit labore eos,
            debitis hendrerit ei sed. Vix diam reformidans ad. Has numquam tibique gubergren et,
            dico epicuri tacimates et per. Mei zril similique conclusionemque ut? Phaedrum
            scribentur cotidieque has eu. Mei dicunt sanctus labores in? Eu esse omnes sed, ius ex
            everti eirmod dolorum? In solum vivendo ocurreret sed, has ex dolorem volutpat
            dissentiet!
            <br />
            <br />
            Ne per insolens persequeris. Est ut vidit antiopam corrumpit. Tempor iracundia ex nec.
            No utamur vituperatoribus eos. Probo posse propriae has ei, ne eum graeci everti
            sapientem, option torquatos ut est. Natum admodum nominavi id ius? Per in iusto verear
            evertitur. Eos in tale apeirian definitiones, modo putent appellantur pro ad. Sea
            dignissim vulputate abhorreant et?
          </Text>
        </View>
      </Stack>
      <WindowControls />
    </>
  )
}
